from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Annotated
from app.db.database import get_db
from app.services.news_service import NewsService

router = APIRouter(prefix="/api/v1/news", tags=["news"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("/top-stories", response_model=None)
async def get_top_stories(db: DbSession) -> List[Dict[str, Any]]:
    service = NewsService(db)
    return await service.get_top_stories()


@router.get("/today-summary", response_model=None)
async def get_today_summary(db: DbSession) -> Dict[str, Any]:
    service = NewsService(db)
    return await service.get_today_summary()


@router.get("/categories", response_model=None)
async def get_categories() -> Dict[str, str]:
    service = NewsService()
    return await service.get_categories()


@router.get("/categories/{category}", response_model=None)
async def get_category_news(category: str, db: DbSession) -> List[Dict[str, Any]]:
    service = NewsService(db)
    return await service.get_news_by_category(category)
