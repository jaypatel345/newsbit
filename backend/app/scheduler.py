from apscheduler.schedulers.asyncio import AsyncIOScheduler
from zoneinfo import ZoneInfo
import logging

from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR

from app.db.database import AsyncSessionLocal
from app.services.gnews_service import GNewsService
from app.services.news_service import NewsService
from app.services.ranking_service import RankingService
from app.services.embedding_processor import EmbeddingProcessor
from app.utils.category_validator import ALLOWED_CATEGORIES


logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler(
    timezone=ZoneInfo("Asia/Kolkata")
)


async def run_news_fetch_job():
    logger.info("Scheduler fired")

    # Use lowercase versions of allowed categories for GNews API
    categories = [cat.lower() for cat in ALLOWED_CATEGORIES if cat != "Other"]

    async with AsyncSessionLocal() as session:

        # 1. Fetch news
        logger.info("Scheduler started fetching news...")

        gnews_service = GNewsService(session)

        logger.info("Fetching top headlines...")
        await gnews_service.sync_top_headlines()

        logger.info("Fetching category news...")
        for category in categories:
            await gnews_service.sync_category(category)

        # 2. Update popularity
        logger.info("Updating popularity scores...")

        ranking_service = RankingService(session)
        await ranking_service.rank_articles()

        # 3. Generate today's summary
        logger.info("Generating today's summary...")

        news_service = NewsService(session)

        try:
            await news_service.generate_and_save_today_summary()
        except Exception:
            logger.exception(
                "Failed to generate today's summary"
            )

        # 4. Generate missing embeddings
        logger.info("Processing pending article embeddings...")

        try:
            embedding_processor = EmbeddingProcessor(session)

            await embedding_processor.embedding_job()

        except Exception:
            logger.exception(
                "Failed to process article embeddings"
            )

        logger.info("Scheduler job completed.")


scheduler.add_job(
    run_news_fetch_job,
    trigger="cron",
    hour=6,
    minute=0,
)


def job_listener(event):
    if event.exception:
        logger.error(
            "Scheduler job failed",
            exc_info=event.exception,
        )
    else:
        logger.info(
            "Scheduler job executed successfully"
        )


scheduler.add_listener(
    job_listener,
    EVENT_JOB_EXECUTED | EVENT_JOB_ERROR,
)