from app.models import Article
from app.services.embedding_service import EmbeddingService, SENTENCE_TRANSFORMERS_AVAILABLE
from sqlalchemy import select


class SemanticSearchService:

    def __init__(self, db, embedding_service :EmbeddingService = None):
        self.db = db
        self.embedding_service = embedding_service
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            raise ImportError(
                "Semantic search requires sentence-transformers. "
                "This feature is not available in the production web service. "
                "Use the GitHub Actions scheduler for embedding generation."
            )

    async def search(
        self,
        query: str,
        top_k: int = 5,
    ):

        # 1. Convert query → embedding
        query_embedding = self.embedding_service.generate_embedding(
            query
        )

        # 2. Vector similarity search

        stmt = (

            select(
                Article,
                Article.embedding.cosine_distance(query_embedding).label(
                    "distance"
                ),
            )
            .where(Article.embedding.is_not(None))
            .order_by(Article.embedding.cosine_distance(query_embedding))

            .limit(top_k)

        )

        result = await self.db.execute(stmt)

        # 3. Return articles + similarity distance
        return result.all()
