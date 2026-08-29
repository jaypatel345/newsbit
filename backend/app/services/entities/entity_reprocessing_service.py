import logging

from app.models.article import Article
from app.services.entity_service import EntityService
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class EntityReprocessingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.entity_service = EntityService()

    async def reprocess_entities(self) -> int:
        """
        Reprocess articles that have not had their entities extracted.

        Returns:
            Number of successfully processed articles.
        """

        result = await self.db.execute(
            select(Article).where(
                Article.entities_processed.is_(False)
            )
        )

        articles = result.scalars().all()

        processed = 0

        for article in articles:
            article_id = article.id
            try:
                entities = await self.entity_service.extract_entities(
                    title=article.title,
                    content=article.content or "",
                )

                await self.entity_service.save_entities(
                    article_id=article_id,
                    entities=entities,
                    db=self.db,
                )

                article.entities_processed = True

                await self.db.flush()
                processed += 1

            except Exception:
                await self.db.rollback()
                logger.exception(
                    "Failed to process entities for article %s",
                    article_id,
                )

        await self.db.commit()

        logger.info(
            "Entity reprocessing completed. %d articles processed.",
            processed,
        )

        return processed
