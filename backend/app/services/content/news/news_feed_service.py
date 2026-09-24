from datetime import UTC, datetime, timedelta

from app.models.article import Article
from sqlalchemy import func, select, text


class NewsFeedService:
    def __init__(self, db):
        self.db = db

    async def get_top_stories(self, limit=10):
        # Without an ORDER BY, Postgres hands back rows in physical order —
        # which is roughly insertion order, so "today's top stories" was
        # serving whatever happened to be stored first (weeks-old articles)
        # and returned the same stale set on every query.
        result = await self.db.execute(
            select(Article)
            .where(text("feed_types @> ARRAY['top_headlines']::varchar[]"))
            .order_by(Article.published_at.desc())
            .limit(limit)
        )
        return result.scalars().all()

    async def get_trending_topics(self, limit=10):
        # Popularity alone has no sense of time, so a story that trended a
        # month ago outranks today's news forever. Consider only the last
        # week, then rank by popularity within it.
        cutoff = datetime.now(UTC) - timedelta(days=7)

        results = await self.db.execute(
            select(Article)
            .where(Article.published_at >= cutoff)
            .order_by(Article.popularity_score.desc(), Article.published_at.desc())
            .limit(limit)
        )
        return results.scalars().all()

    async def get_category_news(self, category: str, limit=10):
        results = await self.db.execute(
            select(Article)
            .where(func.lower(Article.category) == category.lower())
            .order_by(Article.published_at.desc())
            .limit(limit)
        )
        return results.scalars().all()
