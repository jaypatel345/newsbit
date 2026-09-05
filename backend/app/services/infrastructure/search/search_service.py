import logging

from app.models.article import Article
from app.models.article_entity import ArticleEntity
from app.services.core.entities.entity_service import EntityService
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class SearchService:
    """
    Orchestrates the metadata search pipeline.

    This service provides a unified search interface that:
    1. Normalizes and tokenizes user queries
    2. Searches for matching entities
    3. Finds articles related to those entities
    4. Ranks results by relevance (match count) and recency
    5. Returns structured responses with matched entity information
    """

    def __init__(self):
        self.entity_service = EntityService()

    async def search(
        self,
        db: AsyncSession,
        query: str,
        strict_and: bool = False,
        limit: int = 20,
    ) -> dict:
        """
        Execute the complete metadata search pipeline.

        Args:
            db: Database session
            query: User search query (e.g., "Tesla India AI")
            strict_and: If True, require ALL entities to match
            limit: Maximum number of articles to return

        Returns:
            Dictionary with query and ranked results
        """
        # Normalize query
        normalized_query = self._normalize_query(query)

        # Return empty results for empty queries
        if not normalized_query:
            return self._build_response(query, [])

        # Extract search terms
        search_terms = self.entity_service.parse_query(normalized_query)

        if not search_terms:
            return self._build_response(query, [])

        # Search for matching entities
        entity_ids_to_names = await self._find_entities(db, search_terms)

        if not entity_ids_to_names:
            return self._build_response(query, [])

        # Find articles by entity IDs
        articles_with_matches = await self._find_articles(
            db, list(entity_ids_to_names.keys()), strict_and, limit
        )

        # Get matched entities for each article
        results = await self._enrich_results_with_matched_entities(
            db, articles_with_matches, entity_ids_to_names
        )

        return self._build_response(query, results)

    def _normalize_query(self, query: str) -> str:
        """Normalize the user query."""
        return query.strip()

    async def _find_entities(
        self,
        db: AsyncSession,
        search_terms: list[str],
    ) -> dict[int, str]:
        """
        Search for entities matching the search terms.

        Returns a mapping of entity_id -> entity_name
        """
        entity_ids_to_names = {}

        for term in search_terms:
            entities = await self.entity_service.search_entities(db, term, limit=5)
            for entity in entities:
                entity_ids_to_names[entity.id] = entity.name

        return entity_ids_to_names

    async def _find_articles(
        self,
        db: AsyncSession,
        entity_ids: list[int],
        strict_and: bool,
        limit: int,
    ) -> list[dict]:
        """
        Find articles matching the given entity IDs with ranking.

        Returns list of (article, match_count) tuples as dictionaries
        """
        if not entity_ids:
            return []

        # Build the query with match counting
        stmt = (
            select(Article, func.count(ArticleEntity.entity_id).label("match_count"))
            .join(ArticleEntity, Article.id == ArticleEntity.article_id)
            .where(ArticleEntity.entity_id.in_(entity_ids))
            .group_by(Article.id)
        )

        # Add HAVING clause for strict AND mode
        if strict_and:
            stmt = stmt.having(
                func.count(func.distinct(ArticleEntity.entity_id)) == len(entity_ids)
            )

        # Order by match count (desc), then by published date (desc), then by popularity (desc)
        stmt = stmt.order_by(
            desc("match_count"),
            Article.published_at.desc(),
            Article.popularity_score.desc(),
        ).limit(limit)

        result = await db.execute(stmt)

        # Format results
        articles = []
        for article, match_count in result.all():
            articles.append(
                {
                    "article": article,
                    "match_count": match_count,
                }
            )

        return articles

    async def _enrich_results_with_matched_entities(
        self,
        db: AsyncSession,
        articles_with_matches: list[dict],
        entity_ids_to_names: dict[int, str],
    ) -> list[dict]:
        """
        Add matched entity names to each article result.
        """
        results = []

        for item in articles_with_matches:
            article = item["article"]
            match_count = item["match_count"]

            # Get the entity IDs that match this article
            stmt = select(ArticleEntity.entity_id).where(
                ArticleEntity.article_id == article.id,
                ArticleEntity.entity_id.in_(entity_ids_to_names.keys()),
            )
            result = await db.execute(stmt)
            matched_entity_ids = [row[0] for row in result.all()]

            # Map entity IDs to names
            matched_entities = [
                entity_ids_to_names[entity_id] for entity_id in matched_entity_ids
            ]

            results.append(
                {
                    "id": article.id,
                    "title": article.title,
                    "summary": article.summary,
                    "url": article.url,
                    "published_at": article.published_at,
                    "source_name": article.source_name,
                    "image_url": article.image_url,
                    "category": article.category,
                    "popularity_score": article.popularity_score,
                    "match_count": match_count,
                    "matched_entities": matched_entities,
                }
            )

        return results

    def _build_response(self, query: str, results: list[dict]) -> dict:
        """
        Build the final API response.
        """
        return {
            "query": query,
            "results": results,
        }

    async def search_articles(
        self,
        db: AsyncSession,
        query: str,
        limit: int = 10,
    ) -> dict:

        return await self.search(
            db=db,
            query=query,
            strict_and=False,
            limit=10,
        )
