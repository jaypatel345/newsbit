from app.models.article import Article
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class ArticleService:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_article_by_id(self, id: int):
        # 1. Query the Article table and Find the article where Article.id == id.
        result = await self.db.execute(
            select(Article).where(Article.id == id)
        )
        article = result.scalar_one_or_none()

        # 2. If found → return the article or  If not found → return 404 Not Found.
        if article is not None:
            return article
        raise HTTPException(
            status_code=404,
            detail="Article not found",
        )
