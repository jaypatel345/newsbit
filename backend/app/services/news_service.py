from app.core.config import settings
from sqlalchemy import select
from groq import AsyncGroq
from app.models.article import Article
from app.models.summary import Summary


from app.prompts.news import TODAY_BRIEF_PROMPT
import logging
from fastapi import HTTPException
from urllib.parse import urlparse
import json
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
                )
                .order_by(Article.published_at.desc())
                .limit(10)
            )

            articles = [
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
                }
                for id, title, summary, url, author, published_at, source_name, image_url, why_it_matters, category in result.all()
            ]

            return articles
        except Exception as e:
            logger.error(f"Error in get_latest_news:{e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve news")


async def get_today_summary(self):

    summary = await self.db.scalar(select(Summary))

    print(summary)

    if summary is None:

        return {"message": "No summary found"}

    return {
        "id": summary.id,
        "headline": summary.headline,
        "theme": summary.theme,
        "summary": json.loads(summary.summary_json),
        "key_takeaways": json.loads(summary.key_takeaways_json),
        "categories": json.loads(summary.categories_json),
        "created_at": summary.created_at,
        "updated_at": summary.updated_at,
    }

    async def get_categories(self):
        try:
            result = await self.db.execute(
                select(Article.category).distinct().order_by(Article.category)
            )
            categories = [row[0] for row in result.all() if row[0]]
            return categories
        except Exception:
            logger.exception("Error retrieving categories")
            raise HTTPException(status_code=500, detail="Failed to retrieve categories")

    async def get_news_by_category(self, category: str):

        try:
            result = await self.db.execute(
                select(Article)
                .where(Article.category.ilike(category))
                .order_by(Article.published_at.desc())
                .limit(10)
            )

        except Exception:

            logger.exception("Error retrieving news for category: %s", category)
            raise HTTPException(
                status_code=500,
                detail="Failed to retrieve news category",
            )

        return result.scalars().all()

    async def generate_and_save_today_summary(self):
        # 1. Fetch latest articles from DB

        result = await self.db.execute(
            select(
                Article.title,
                Article.summary,
                Article.why_it_matters,
                Article.category,
                Article.published_at,
                Article.source_name,
            )
            .order_by(Article.published_at.desc())
            .limit(10)
        )
        input = [
            {
                "title": title,
                "summary": summary,
                "why_it_matters": why_it_matters,
                "category": category,
                "published_at": published_at,
                "source_name": source_name,
            }
            for title, summary, why_it_matters, category, published_at, source_name in result.all()
        ]

        # 2. Generate summary using LLM

        response = await groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
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
            raise e

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
