import asyncio

from app.models.article import Article
from app.services.embedding_service import EmbeddingService
from sqlalchemy import select


class EmbeddingProcessor:
    def __init__(self, db):
        self.db = db
        self.embedding_service = EmbeddingService()

    async def embedding_job(self):
        batch_size = 10

        while True:
            # 1. Find articles without embeddings
            result = await self.db.execute(
                select(Article)
                .where(Article.embedding.is_(None))
                .limit(batch_size)
            )

            articles = result.scalars().all()

            # Nothing left to process
            if not articles:
                print("All articles have been processed with embeddings.")
                break

            print(f"Processing batch of {len(articles)} articles...")

            # 2. Generate embeddings
            for i, article in enumerate(articles):
                # Skip incomplete articles
                if not article.title or not article.summary or not article.content:
                    print(f"Skipping article {article.id} - incomplete data")
                    continue

                text = self._build_embedding_text(article)

                try:
                    print(f"Processing article {i+1}/{len(articles)}: {article.title[:50]}...")
                    embedding = self.embedding_service.generate_embedding(text)

                    # 3. Save embedding
                    article.embedding = embedding
                    print(f"✓ Successfully generated embedding (length: {len(embedding)})")

                except Exception as e:
                    print(f"✗ Failed to generate embedding for article {article.id}: {e}")

            # 4. Commit the entire batch
            await self.db.commit()
            print(f"Batch completed. Processed {len(articles)} articles.")

            # Add small delay between batches
            await asyncio.sleep(1)

    @staticmethod
    def _build_embedding_text(article: Article) -> str:
        return f"""
        Title: {article.title}

        Summary: {article.summary}

        Content: {article.content}
        """.strip()
