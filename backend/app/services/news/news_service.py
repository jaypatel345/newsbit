import json
import logging
from datetime import UTC, datetime, timedelta
from urllib.parse import urlparse

from app.core.config import settings
from app.models.article import Article
from app.models.summary import Summary
from app.prompts.news import TODAY_BRIEF_PROMPT
from app.utils.category_validator import ALLOWED_CATEGORIES
from fastapi import HTTPException
from groq import AsyncGroq
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
logger = logging.getLogger(__name__)


def clean_title(title: str) -> str:
    if " - " in title:
        return title.rsplit(" - ", 1)[0]
    return title


class NewsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def get_domain(self, url: str) -> str:
        parsed = urlparse(url)
        return f"{parsed.scheme}://{parsed.netloc}"

    async def get_top_stories(self):
        today = datetime.now(UTC) - timedelta(days=7)
        try:
            result = await self.db.execute(
                select(
                    Article.id,
                    Article.title,
                    Article.summary,
                    Article.url,
                    Article.author,
                    Article.published_at,
                    Article.source_name,
                    Article.image_url,
                    Article.why_it_matters,
                    Article.category,
                    Article.popularity_score,
                )
                .where(
                    Article.summary.is_not(None),
                    Article.published_at >= today,
                    Article.image_url.is_not(None),
                    Article.image_url != "",
                )
                .order_by(
                    Article.popularity_score.desc(),
                    Article.published_at.desc(),
                )
                .limit(10)
            )

            # Use fetchall() for better performance
            rows = result.fetchall()

            return [
                {
                    "id": id,
                    "title": title,
                    "summary": summary,
                    "url": url,
                    "author": author,
                    "domain": self.get_domain(url),
                    "published_at": published_at,
                    "source_name": source_name,
                    "image_url": image_url,
                    "why_it_matters": why_it_matters,
                    "category": category,
                    "popularity_score": popularity_score,
                }
                for id, title, summary, url, author, published_at, source_name, image_url, why_it_matters, category, popularity_score in rows
            ]
        except Exception as e:
            logger.error(f"Error in get_latest_news:{e}")
            raise HTTPException(
                status_code=500, detail="Failed to retrieve news"
            ) from e

    async def get_today_summary(self):
        # Try to get recent summary from last 24 hours
        today = datetime.now(UTC) - timedelta(hours=24)
        result = await self.db.execute(
            select(Summary)
            .where(Summary.updated_at >= today)
            .order_by(Summary.updated_at.desc())
            .limit(1)
        )
        summary = result.scalar_one_or_none()

        # If no recent summary, fall back to the most recent one regardless of age
        if summary is None:
            result = await self.db.execute(
                select(Summary).order_by(Summary.updated_at.desc()).limit(1)
            )
            summary = result.scalar_one_or_none()

        if summary is None:
            return {"message": "No summary found"}

        # Check if summary is outdated (older than 24 hours)
        is_outdated = summary.updated_at < today

        # Parse JSON fields only once
        return {
            "id": summary.id,
            "headline": summary.headline,
            "theme": summary.theme,
            "summary": json.loads(summary.summary_json),
            "key_takeaways": json.loads(summary.key_takeaways_json),
            "categories": json.loads(summary.categories_json),
            "created_at": summary.created_at,
            "updated_at": summary.updated_at,
            "is_outdated": is_outdated,
        }

    async def get_categories(self):
        try:
            result = await self.db.execute(
                select(Article.category)
                .group_by(Article.category)
                .having(func.count(Article.id) >= 3)
                .order_by(Article.category)
            )
            return [row[0] for row in result.all() if row[0]]
        except Exception as e:
            logger.exception("Error retrieving categories")
            raise HTTPException(
                status_code=500, detail="Failed to retrieve categories"
            ) from e

    async def get_news_by_category(self, category: str):
        # Validate category against allowed categories
        if category not in ALLOWED_CATEGORIES:
            logger.warning("Invalid category requested: %s", category)
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category '{category}'. Must be one of: {', '.join(sorted(ALLOWED_CATEGORIES))}",
            )

        try:
            result = await self.db.execute(
                select(Article)
                .where(
                    Article.category == category,
                    Article.image_url.is_not(None),
                    Article.image_url != "",
                )
                .order_by(Article.published_at.desc())
                .limit(10)
            )

        except Exception as e:
            logger.exception("Error retrieving news for category: %s", category)
            raise HTTPException(
                status_code=500,
                detail="Failed to retrieve news category",
            ) from e

        return result.scalars().all()

    async def generate_and_save_today_summary(self):
        # 1. Fetch latest articles from DB
        today = datetime.now(UTC) - timedelta(hours=24)
        result = await self.db.execute(
            select(
                Article.title,
                Article.summary,
                Article.why_it_matters,
                Article.category,
                Article.published_at,
                Article.source_name,
                Article.url,
            )
            .where(
                Article.summary.is_not(None),
                Article.published_at >= today,
                Article.image_url.is_not(None),
                Article.image_url != "",
            )
            .order_by(Article.popularity_score.desc(), Article.published_at.desc())
            .limit(15)
        )
        input = [
            {
                "title": title,
                "summary": summary,
                "why_it_matters": why_it_matters,
                "category": category,
                "published_at": published_at,
                "source_name": source_name,
                "url": url,
            }
            for title, summary, why_it_matters, category, published_at, source_name, url in result.all()
        ]

        # 2. Generate summary using LLM

        response = await groq_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": TODAY_BRIEF_PROMPT,
                },
                {
                    "role": "user",
                    "content": json.dumps(input, default=str),
                },
            ],
        )

        try:
            result = json.loads(response.choices[0].message.content)

        except json.JSONDecodeError as e:
            print("Invalid JSON:")
            print(response.choices[0].message.content)
            raise e from e

        # 3. Insert/update Summary table

        existing_summary = await self.db.scalar(select(Summary).limit(1))

        if existing_summary:
            existing_summary.headline = result["headline"]
            existing_summary.theme = result["theme"]
            existing_summary.summary_json = json.dumps(result["summary"])
            existing_summary.key_takeaways_json = json.dumps(result["key_takeaways"])
            existing_summary.categories_json = json.dumps(result["categories"])
        else:
            existing_summary = Summary(
                headline=result["headline"],
                theme=result["theme"],
                summary_json=json.dumps(result["summary"]),
                key_takeaways_json=json.dumps(result["key_takeaways"]),
                categories_json=json.dumps(result["categories"]),
            )
            self.db.add(existing_summary)

        await self.db.commit()
        await self.db.refresh(existing_summary)
        return existing_summary
