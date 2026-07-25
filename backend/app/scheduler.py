from apscheduler.schedulers.asyncio import AsyncIOScheduler
from zoneinfo import ZoneInfo

from app.db.database import AsyncSessionLocal
from app.services.gnews_service import GNewsService

scheduler = AsyncIOScheduler(timezone=ZoneInfo("Asia/Kolkata"))


async def run_news_fetch_job():
    categories = [
        "technology",
        "business",
        "sports",
        "science",
        "world",
        "health",
        "entertainment",
        "nation",
        "general",
    ]

    async with AsyncSessionLocal() as session:
        service = GNewsService(session)

        # Fetch Top Headlines
        await service.sync_top_headlines()

        # Fetch all categories
        for category in categories:
            await service.sync_category(category)


scheduler.add_job(
    run_news_fetch_job,
    trigger="cron",
    hour=6,
    minute=0,
)
