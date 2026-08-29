from app.db.database import get_db
from app.schemas.article import ArticleResponse
from app.services.news.article_service import ArticleService
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/api/v1/news/articles",
    tags=["article"],
)


def get_article_service(
    db: AsyncSession = Depends(get_db),
) -> ArticleService:
    return ArticleService(db)


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: int,
    service: ArticleService = Depends(get_article_service),
):
    return await service.get_article_by_id(article_id)
