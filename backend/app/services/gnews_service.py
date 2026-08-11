import logging

from app.core.config import settings
from app.services.news_processor import NewsProcessor
from fastapi import HTTPException
from httpx import AsyncClient, HTTPStatusError, TimeoutException
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class GNewsService:
    def __init__(self, db: AsyncSession):
        self.base_url = settings.G_NEWS_API_URL
        self.api_key = settings.G_NEWS_API_KEY
        self.timeout = 30.0
        self.db = db
        self.processor = NewsProcessor(db)

    async def _fetch_articles(
        self, params: dict[str, str], error_context: str
    ) -> list[dict]:
        """Shared method to fetch articles with error handling."""
        try:
            async with AsyncClient(timeout=self.timeout) as client:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()
                articles = data.get("articles", [])

                if not articles:
                    logger.warning(f"No articles found for {error_context}")

                return articles

        except TimeoutException as e:
            logger.error(f"Timeout fetching {error_context}: {str(e)}")
            raise HTTPException(
                status_code=504, detail=f"External API timeout: {str(e)}"
            )
        except HTTPStatusError as e:
            logger.error(
                f"HTTP error fetching {error_context}: {e.response.status_code}"
            )
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"External API error: {str(e)}",
            )
        except Exception as e:
            logger.exception(f"Unexpected error fetching {error_context}")
            raise HTTPException(
                status_code=502, detail=f"Failed to fetch news: {str(e)}"
            )

    async def fetch_top_headlines(self) -> list[dict]:
        """Fetch top headlines in English."""
        params = {"lang": "en", "apikey": self.api_key}
        return await self._fetch_articles(params, "top headlines")

    async def fetch_category(self, category: str) -> list[dict]:
        """Fetch articles by category."""
        if not category or not category.strip():
            raise HTTPException(status_code=400, detail="Category cannot be empty")

        params = {
            "category": category.strip().lower(),
            "lang": "en",
            "apikey": self.api_key,
        }
        return await self._fetch_articles(params, f"category '{category}'")

    async def sync_top_headlines(self):

        # Fetch Top Headlines
        articles = await self.fetch_top_headlines()

        # Add feed type

        for article in articles:
            article["feed_types"] = "top_headlines"

        # Process articles
        return await self.processor.process_articles(
            articles=articles,
        )

    async def sync_category(self, category: str):

        # Fetch category news
        articles = await self.fetch_category(category)

        # Add feed type
        for article in articles:
            article["feed_types"] = f"category:{category}"

        # Process articles
        return await self.processor.process_articles(
            articles=articles,
        )
