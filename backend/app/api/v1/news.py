from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.services.news_service import NewsService

router = APIRouter(prefix="/api/v1/news", tags=["news"])


@router.get("/top-stories")
async def get_top_stories(
    db: AsyncSession = Depends(get_db),
    service: NewsService = Depends(NewsService),
):
    return await service.get_top_stories(db)


@router.get("/today-summary")
async def get_today_summary(
    db: AsyncSession = Depends(get_db),
    service: NewsService = Depends(NewsService),
):
    return await service.get_today_summary(db)


@router.get("/categories")
async def get_categories(
    service: NewsService = Depends(NewsService),
):
    return await service.get_categories()


@router.get("/categories/{category}")
async def get_category_news(
    category: str,
    db: AsyncSession = Depends(get_db),
    service: NewsService = Depends(NewsService),
):
    return await service.get_news_by_category(db, category)
