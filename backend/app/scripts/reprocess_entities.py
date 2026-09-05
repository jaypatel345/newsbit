import asyncio

from app.db.database import AsyncSessionLocal
from app.services.core.entities.entity_reprocessing_service import (
    EntityReprocessingService,
)


async def main():
    async with AsyncSessionLocal() as db:
        service = EntityReprocessingService(db)

        count = await service.reprocess_entities()

        print(f"Processed {count} articles")


if __name__ == "__main__":
    asyncio.run(main())
