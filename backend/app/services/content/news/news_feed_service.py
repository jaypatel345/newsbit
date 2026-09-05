from app.models.article import Article
from sqlalchemy import select, text


class NewsFeedService:
    def __init__(self, db):
        self.db = db

    async def get_top_stories(self, limit=10):
        result = await self.db.execute(
            select(Article)
            .where(text("feed_types @> ARRAY['top_headlines']::varchar[]"))
            .limit(limit)
        )
        return result.scalars().all()

    async def get_trending_topics(self, limit=10):
        results = await self.db.execute(
            select(Article).order_by(Article.popularity_score.desc()).limit(limit)
        )
        return results.scalars().all()

    async def get_category_news(self, category: str, limit=10):
        results = await self.db.execute(
            select(Article)
            .where(Article.category == category)
            .limit(limit)
            .order_by(Article.published_at.desc())
        )
        return results.scalars().all()
