from fastapi import APIRouter, Depends
from app.db.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from app.services.gnews_service import GNewsService
from app.services.news_service import NewsService

router = APIRouter(prefix="/api/v1/admin/news", tags=["admin"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("/fetch", response_model=None)
async def test_fetch1(db: DbSession):
    service = GNewsService(db)
    result = await service.sync_top_headlines()
    return {
        "count": len(result),
        "articles": result,
    }


@router.post("/fetch/{category}", response_model=None)
async def test_fetch(category: str, db: DbSession):
    service = GNewsService(db)

    if category == "top":
        articles = await service.sync_top_headlines()
    else:
        articles = await service.sync_category(category)

    return {
        "category": category,
        "count": len(articles),
        "articles": articles,
    }


@router.post("/summary", response_model=None)
async def test_summaries(db: DbSession):
    service = NewsService(db)

    summary = await service.generate_and_save_today_summary()
    return summary
