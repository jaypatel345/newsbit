import asyncio
import logging

from app.db.database import AsyncSessionLocal
from app.services.embedding_processor import EmbeddingProcessor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def main():
    async with AsyncSessionLocal() as db:
        processor = EmbeddingProcessor(db)
        await processor.embedding_job()


if __name__ == "__main__":
    asyncio.run(main())
