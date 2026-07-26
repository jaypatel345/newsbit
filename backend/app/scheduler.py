from apscheduler.schedulers.asyncio import AsyncIOScheduler
from zoneinfo import ZoneInfo
import logging

from app.db.database import AsyncSessionLocal
from app.services.gnews_service import GNewsService
from app.services.news_service import NewsService
from app.services.ranking_service import RankingService

logger = logging.getLogger(__name__)

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
        gnews_service = GNewsService(session)

        logger.info("Fetching top headlines...")
        await gnews_service.sync_top_headlines()

        logger.info("Fetching category news...")
        for category in categories:
            await gnews_service.sync_category(category)

        logger.info("Updating popularity scores...")
        ranking_service = RankingService(session)
        await ranking_service.rank_articles()

        logger.info("Generating today's summary...")
        news_service = NewsService(session)

        try:
            await news_service.generate_and_save_today_summary()
        except Exception:
            logger.exception("Failed to generate today's summary")

        logger.info("Scheduler job completed.")


scheduler.add_job(
    run_news_fetch_job,
    trigger="cron",
    hour=6,
    minute=0,
)
