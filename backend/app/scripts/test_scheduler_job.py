import asyncio
import logging

from app.scheduler import run_news_fetch_job

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def main():
    await run_news_fetch_job()


if __name__ == "__main__":
    asyncio.run(main())
