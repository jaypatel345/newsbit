from fastapi import APIRouter, Depends
from app.db.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.news_service import NewsService

router = APIRouter(prefix="/api/v1/admin/news", tags=["admin"])


@router.post("/fetch")
async def fetch_news(
    db: AsyncSession = Depends(get_db),
    service: NewsService = Depends(NewsService),
):
    return await service.fetch_news(db)
