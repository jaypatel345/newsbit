from app.models.article import Article
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone

CATEGORY_PRIORITY = {
    "AI": 10,
    "Technology": 10,
    "Politics": 10,
    "World": 10,
    "Business": 8,
    "Science": 7,
    "Health": 6,
    "India": 5,
    "Entertainment": 3,
    "Sports": 3,
}


class RankingService:

    def __init__(self, db: AsyncSession):
        self.db = db

    def category_score(self, article: Article) -> int:
        return CATEGORY_PRIORITY.get(article.category, 0)

    def calculate_score(self, article: Article) -> float:
        score = 0

        score += self.category_score(article)
        score += self.freshness_score(article)
        score += self.overlap_score(article)

        return score

    async def rank_articles(self):

        result = await self.db.execute(select(Article))

        articles = result.scalars().all()

        for article in articles:
            article.popularity_score = self.calculate_score(article)

        await self.db.commit()

        articles.sort(
            key=lambda x: x.popularity_score,
            reverse=True,
        )

        return articles[:10]

    def freshness_score(self, article: Article) -> float:

        now = datetime.now(timezone.utc)
        age_hours = (now - article.published_at).total_seconds() / 3600

        if age_hours <= 6:
            return 10

        elif age_hours <= 12:
            return 8

        elif age_hours <= 24:
            return 6

        elif age_hours <= 48:
            return 3

        else:
            return 1

    def overlap_score(self, article: Article) -> int:

        count = len(article.feed_types or [])

        if count >= 3:
            return 8

        elif count == 2:
            return 5

        return 0
