from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.db.database import AsyncSessionLocal
from app.services.news_service import NewsService
from zoneinfo import ZoneInfo

scheduler = AsyncIOScheduler(timezone=ZoneInfo("Asia/Kolkata"))


async def run_news_fetch_job():
    async with AsyncSessionLocal() as session:
        await NewsService().fetch_news(session)


scheduler.add_job(
    run_news_fetch_job,
    trigger="cron",
    hour=6,
    minute=0,
)
