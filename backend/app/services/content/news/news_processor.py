import asyncio
import logging
from datetime import UTC, datetime, timedelta

from app.models.article import Article
from app.services.core.entities.entity_service import EntityService
from app.services.infrastructure.ai.llm_service import LLMService
from app.utils.category_validator import normalize_and_validate_category
from app.utils.dedup import canonicalize_url, normalize_title
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


def clean_title(title: str) -> str:
    if " - " in title:
        return title.rsplit(" - ", 1)[0]
    return title


class NewsProcessor:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.llm_service = LLMService()
        self.entity_service = EntityService()

    async def process_articles(self, articles: list[dict]):
        """
        Unified pipeline for processing fetched articles.
        Responsibilities:
        1. Validate article data
        2. Detect duplicates
        3. Generate AI summary
        4. Save article
        5. Return processed articles
        """
        new_articles = []
        saved_articles = []
        # De-dup keys seen earlier in *this* batch. The DB is checked too,
        # so an article is never stored twice across runs or feeds either.
        seen_urls: set[str] = set()
        seen_canonical: set[str] = set()
        seen_titles: set[tuple[str, str]] = set()

        for article in articles:
            url = article.get("url")
            if not url:
                continue

            canonical_url = canonicalize_url(url)
            raw_title = article.get("title") or ""
            source_name = (article.get("source") or {}).get("name") or ""
            title_key = (
                source_name.strip().lower(),
                normalize_title(clean_title(raw_title)),
            )

            # Already handled earlier in this batch?
            if url in seen_urls:
                continue
            if canonical_url and canonical_url in seen_canonical:
                continue
            if title_key[1] and title_key in seen_titles:
                continue

            # Filter out articles without valid images
            image_url = article.get("image")
            if not image_url or image_url.strip() == "":
                logger.info(
                    f"Skipping article without image: {article.get('title', 'Unknown')}"
                )
                continue

            seen_urls.add(url)
            if canonical_url:
                seen_canonical.add(canonical_url)
            if title_key[1]:
                seen_titles.add(title_key)

            existing_article = await self._find_existing_article(
                url=url,
                canonical_url=canonical_url,
                source_name=source_name,
                normalized_title=title_key[1],
            )

            if existing_article:
                if article["feed_types"] not in existing_article.feed_types:
                    existing_article.feed_types.append(article["feed_types"])

                existing_article.image_url = (
                    article.get("image") or existing_article.image_url
                )

                existing_article.description = (
                    article.get("description") or existing_article.description
                )

                if canonical_url and not existing_article.url_canonical:
                    existing_article.url_canonical = canonical_url

                continue

            new_articles.append(article)

            # 2. Call LLMService
            try:
                summary_result, entities = await asyncio.gather(
                    self.llm_service.generate_summary(article),
                    self.entity_service.extract_entities(
                        title=clean_title(article["title"]),
                        content=article.get("content", ""),
                    ),
                )
            except Exception:
                continue
            print(summary_result)
            article["summary"] = summary_result.get("summary", "")
            article["why_it_matters"] = summary_result.get("why_it_matters", "")
            # Validate and normalize the category
            raw_category = summary_result.get("category")
            article["category"] = normalize_and_validate_category(raw_category)
            published_at_str = article.get("publishedAt")

            if not published_at_str:
                continue

            published_at = datetime.fromisoformat(
                published_at_str.replace("Z", "+00:00")
            )

            # 3. Save articles

            db_article = Article(
                title=clean_title(article["title"]),
                feed_types=[article["feed_types"]],
                popularity_score=0.0,
                url=article["url"],
                url_canonical=canonicalize_url(article["url"]) or None,
                content=article.get("content"),
                author=article.get("author"),
                source_id=article.get("source", {}).get("id"),
                source_name=article.get("source", {}).get("name"),
                image_url=article.get("image"),
                description=article.get("description"),
                summary=article.get("summary"),
                why_it_matters=article.get("why_it_matters"),
                category=article.get("category"),
                published_at=published_at,
                source_url=article.get("source", {}).get("url"),
            )
            try:
                # Savepoint so a duplicate slipping past the checks above
                # (e.g. a concurrent insert) hits the unique constraint
                # without poisoning the rest of the batch.
                async with self.db.begin_nested():
                    self.db.add(db_article)
                    await self.db.flush()

                    # Save entities using the normalized entity service
                    await self.entity_service.save_entities(
                        db=self.db,
                        article_id=db_article.id,
                        entities=entities,
                    )

                    # Mark entities as processed
                    db_article.entities_processed = True
            except IntegrityError:
                logger.info(
                    "Skipping duplicate article: %s",
                    article.get("url", "Unknown"),
                )
                continue

            saved_articles.append(db_article)

            logger.info(
                "Processed %d articles, %d new",
                len(articles),
                len(new_articles),
            )

        if saved_articles:
            try:
                await self.db.commit()
            except Exception:
                await self.db.rollback()
                raise

        for article in saved_articles:
            await self.db.refresh(article)

        return saved_articles

    async def _find_existing_article(
        self,
        *,
        url: str,
        canonical_url: str,
        source_name: str,
        normalized_title: str,
    ) -> Article | None:
        """Return the stored article that ``url`` refers to, if any.

        Matches on the exact URL, on the tracking-free canonical URL, and
        finally on (source, normalized title) so the same story re-published
        by one source under a different URL is still recognised.
        """
        url_filters = [Article.url == url]
        if canonical_url:
            url_filters.append(Article.url == canonical_url)
            url_filters.append(Article.url_canonical == canonical_url)

        with self.db.no_autoflush:
            result = await self.db.execute(
                select(Article).where(or_(*url_filters)).limit(1)
            )
            existing = result.scalar_one_or_none()
            if existing:
                return existing

            if not (source_name and normalized_title):
                return None

            # Same-source re-publish check: compare normalized titles in
            # Python over a bounded recent window for that source.
            recent_cutoff = datetime.now(UTC) - timedelta(days=7)
            candidates = await self.db.execute(
                select(Article).where(
                    Article.source_name == source_name,
                    Article.published_at >= recent_cutoff,
                )
            )
            for candidate in candidates.scalars():
                if normalize_title(candidate.title) == normalized_title:
                    return candidate

        return None
