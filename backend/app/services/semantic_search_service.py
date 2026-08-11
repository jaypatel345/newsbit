from app.models import Article
from app.services.embedding_service import EmbeddingService
from sqlalchemy import select


class SemanticSearchService:

    def __init__(self, db, embedding_service :EmbeddingService ):
        self.db = db
        self.embedding_service = embedding_service

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
