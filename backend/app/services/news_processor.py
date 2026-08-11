import asyncio
import logging
from datetime import datetime

from app.models.article import Article
from app.services.entity_service import EntityService
from app.services.llm_service import LLMService
from sqlalchemy import select
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
        seen_urls = set()

        for article in articles:

            url = article.get("url")
            if not url:
                continue
            if url in seen_urls:
                continue

            # Filter out articles without valid images
            image_url = article.get("image")
            if not image_url or image_url.strip() == "":
                logger.info(f"Skipping article without image: {article.get('title', 'Unknown')}")
                continue

            seen_urls.add(url)

            with self.db.no_autoflush:

                db_result = await self.db.execute(
                    select(Article).where(Article.url == url)
                )

            existing_article = db_result.scalar_one_or_none()

            if existing_article:

                if article["feed_types"] not in existing_article.feed_types:

                    existing_article.feed_types.append(article["feed_types"])

                existing_article.image_url = (
                    article.get("image") or existing_article.image_url
                )

                existing_article.description = (
                    article.get("description") or existing_article.description
                )

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
            article["category"] = summary_result["category"]
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
