from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.db.database import AsyncSessionLocal
from app.services.news_service import NewsService

scheduler = AsyncIOScheduler()


async def run_news_fetch_job():
    async with AsyncSessionLocal() as session:
        await NewsService().fetch_news(session)


scheduler.add_job(
    run_news_fetch_job,
    trigger="interval",
    minutes=1,
    # trigger="cron",
    # hour=18,
    # minute=30,
)
