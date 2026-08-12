import logging
from typing import Annotated, Any

from app.core.config import settings
from app.db.database import get_db
from app.scheduler import run_news_fetch_job
from app.services.news_service import NewsService
from app.services.ranking_service import RankingService
from fastapi import APIRouter, Depends, Header, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/v1/news", tags=["news"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
logger = logging.getLogger(__name__)


@router.get("/top-stories", response_model=None)
async def get_top_stories(db: DbSession, response: Response) -> list[dict[str, Any]]:
    service = NewsService(db)
    stories = await service.get_top_stories()
    
    # Add caching headers for better performance
    response.headers["Cache-Control"] = "public, max-age=300, s-maxage=300"  # 5 minutes
    response.headers["CDN-Cache-Control"] = "public, max-age=300"
    
    return stories


@router.get("/today-summary", response_model=None)
async def get_today_summary(db: DbSession, response: Response) -> dict[str, Any]:
    service = NewsService(db)
    summary = await service.get_today_summary()
    
    # Add caching headers for better performance
    response.headers["Cache-Control"] = "public, max-age=300, s-maxage=300"  # 5 minutes
    response.headers["CDN-Cache-Control"] = "public, max-age=300"
    
    return summary


@router.get("/categories", response_model=None)
async def get_categories(db: DbSession, response: Response) -> dict[str, str]:
    service = NewsService(db)
    categories = await service.get_categories()
    
    # Add caching headers for better performance
    response.headers["Cache-Control"] = "public, max-age=600, s-maxage=600"  # 10 minutes
    response.headers["CDN-Cache-Control"] = "public, max-age=600"
    
    return categories


@router.get("/categories/{category}", response_model=None)
async def get_category_news(category: str, db: DbSession) -> list[dict[str, Any]]:
    service = NewsService(db)
    return await service.get_news_by_category(category)


@router.post("/rank")
async def rank_articles(db: DbSession):
    service = RankingService(db)
    result = await service.rank_articles()
    return result


@router.post("/run-job")
async def run_job(authorization: str = Header(None)):

    expected = f"Bearer {settings.SCHEDULER_SECRET}"

    if authorization != expected:

        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        logger.info("Manual scheduler started")
        await run_news_fetch_job()
        logger.info("Manual scheduler completed")
        return {"success": True, "message": "Scheduler completed successfully"}

    except Exception as e:
        logger.exception("Scheduler failed")
        raise HTTPException(
            status_code=500,
            detail=f"Scheduler failed: {str(e)}",
        )
