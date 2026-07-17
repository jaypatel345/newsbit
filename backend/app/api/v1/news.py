from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.services.news_service import NewsService

router = APIRouter(prefix="/news/v1", tags=["news"])


@router.get("/")
async def get_news(
    db: AsyncSession = Depends(get_db),
    service: NewsService = Depends(NewsService),
):
    return await service.get_latest_news(db)


@router.post("/fetch")
async def fetch_news(
    db: AsyncSession = Depends(get_db),
    service: NewsService = Depends(NewsService),
):
    return await service.fetch_news(db)
