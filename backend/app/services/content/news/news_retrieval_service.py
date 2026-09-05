from app.services.content.news.news_feed_service import NewsFeedService
from app.services.core.entities.entity_service import EntityService
from app.services.infrastructure.ai.semantic_search_service import SemanticSearchService


class NewsRetrievalService:
    def __init__(self, db, embedding_service):
        self.db = db
        self.entity_service = EntityService()
        self.embedding_service = embedding_service
        self.semantic_search_service = SemanticSearchService(
            db=db,
            embedding_service=embedding_service,
        )
        self.news_feed_service = NewsFeedService(db=db)

    async def search_news(
        self,
        query: str,
        limit: int = 5,
    ):
        # 1. Metadata search
        metadata_results = await self._metadata_search(
            query=query,
            limit=limit,
        )

        # 2. If metadata gives enough results, return them
        if metadata_results and len(metadata_results) >= limit:
            return metadata_results

        # 3. Fallback to semantic search if metadata search failed or returned insufficient results
        try:
            return await self.semantic_search_service.search(
                query=query,
                top_k=limit,
            )
        except Exception:
            # If semantic search also fails, return metadata results (even if fewer than limit)
            if metadata_results:
                return metadata_results
            return []

    async def _metadata_search(
        self,
        query: str,
        limit: int,
    ):
        entity_names = self.entity_service.parse_query(query)

        if not entity_names:
            return []

        entities = []

        for name in entity_names:
            matches = await self.entity_service.search_entities(
                db=self.db,
                query=name,
                limit=5,
            )

            entities.extend(matches)

        entity_ids = list({entity.id for entity in entities})

        if not entity_ids:
            return []

        return await self.entity_service.search_articles_by_entities(
            db=self.db,
            entity_ids=entity_ids,
            limit=limit,
        )

    async def get_top_stories(self, limit: int = 10):
        return await self.news_feed_service.get_top_stories(limit)

    async def get_trending_topics(self, limit: int = 10):
        return await self.news_feed_service.get_trending_topics(limit)

    async def get_category_news(self, category: str, limit: int = 10):
        return await self.news_feed_service.get_category_news(category, limit)
