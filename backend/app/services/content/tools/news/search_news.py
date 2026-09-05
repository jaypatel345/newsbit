from app.models.article import Article
from app.services.core.entities.entity_service import EntityService
from app.services.infrastructure.ai.embedding_service import (
    SENTENCE_TRANSFORMERS_AVAILABLE,
    EmbeddingService,
)
from app.services.infrastructure.ai.semantic_search_service import SemanticSearchService
from langchain_core.tools import tool
from sqlalchemy import or_, select


def create_search_news_tool(db):
    @tool
    async def search_news(query: str):
        """
        ALWAYS use this tool when the user asks about news, current events, or wants to explain a news story.
        Search the Newsbit database for relevant news articles using metadata search first, then semantic search fallback.
        Returns article details including title, summary, source, and publication date.
        """
        articles = []

        # 1. Try metadata search first (faster)
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                entity_service = EntityService()
                entity_names = entity_service.parse_query(query)
                print(f"Extracted entity names: {entity_names}")

                if entity_names:
                    entities = []
                    for name in entity_names:
                        matches = await entity_service.search_entities(
                            db=db,
                            query=name,
                            limit=5,
                        )
                        entities.extend(matches)

                    entity_ids = list({entity.id for entity in entities})
                    print(f"Found entity IDs: {entity_ids}")

                    if entity_ids:
                        articles = await entity_service.search_articles_by_entities(
                            db=db,
                            entity_ids=entity_ids,
                            limit=5,
                        )
                        print(f"Metadata search returned {len(articles)} articles")
                        print(
                            f"Article types: {[type(article) for article in articles]}"
                        )
            except Exception as e:
                print(f"Metadata search failed: {e}")
                import traceback

                traceback.print_exc()
                articles = []

        # 2. If metadata search didn't return enough results, try semantic search
        if not articles and SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                embedding_service = EmbeddingService()
                semantic_search = SemanticSearchService(db, embedding_service)
                results = await semantic_search.search(query, top_k=5)
                articles = [result[0] for result in results]  # Extract Article objects
            except Exception as e:
                print(f"Semantic search failed: {e}")
                articles = []

        # 3. Fallback to keyword search if both metadata and semantic search fail
        if not articles:
            search_pattern = f"%{query}%"
            stmt = (
                select(Article)
                .where(
                    or_(
                        Article.title.ilike(search_pattern),
                        Article.summary.ilike(search_pattern),
                        Article.content.ilike(search_pattern),
                    )
                )
                .order_by(Article.published_at.desc())
                .limit(5)
            )
            result = await db.execute(stmt)
            articles = result.scalars().all()

        if not articles:
            return "No relevant articles found."

        # Format articles as readable text for the LLM
        formatted_results = []
        for article in articles:
            # Handle both dict and Article objects
            if isinstance(article, dict):
                title = article.get("title", "N/A")
                summary = article.get("summary", "N/A")
                source_name = article.get("source_name", "N/A")
                published_at = article.get("published_at", "N/A")
                url = article.get("url", "N/A")
            else:
                title = article.title
                summary = article.summary
                source_name = article.source_name
                published_at = article.published_at
                url = article.url

            formatted_results.append(  # noqa: PERF401
                f"Title: {title}\n"
                f"Summary: {summary}\n"
                f"Source: {source_name}\n"
                f"Published: {published_at}\n"
                f"URL: {url}"
            )

        return "\n\n".join(formatted_results)

    return search_news
