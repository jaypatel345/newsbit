from app.core.config import settings
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from groq import AsyncGroq
from datetime import datetime
from app.models.article import Article
from app.prompts.news import NEWS_SUMMARY_PROMPT, TODAY_BRIEF_PROMPT
import logging
from fastapi import HTTPException
from urllib.parse import urlparse
import json

groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
logger = logging.getLogger(__name__)


def clean_title(title: str) -> str:
    if " - " in title:
        return title.rsplit(" - ", 1)[0]
    return title


class NewsService:
    def get_domain(self, url: str) -> str:
        parsed = urlparse(url)
        return f"{parsed.scheme}://{parsed.netloc}"

    async def get_top_stories(self, db: AsyncSession):

        try:
            result = await db.execute(
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

    async def fetch_news(self, db: AsyncSession):

        # 1. Fetch news from external API
        try:
            async with AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    settings.G_NEWS_API_URL,
                    params={"lang": "en", "apikey": settings.G_NEWS_API_KEY},
                )
                response.raise_for_status()
                articles = response.json().get("articles", [])
        except Exception as e:
            logger.exception("Error fetching news from external API")
            raise HTTPException(
                status_code=502,
                detail=str(e),
            )
        # 2. Filter duplicates
        result = await db.execute(select(Article.url))
        existing_urls = {url for (url,) in result.all()}

        new_articles = [
            article for article in articles if article["url"] not in existing_urls
        ]

        # 3. Save new articles
        for article in new_articles:
            try:
                chat_completion = await groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": NEWS_SUMMARY_PROMPT},
                        {
                            "role": "user",
                            "content": f"""
                                      Title: {article["title"]}
                                      Description: {article.get("description", "")}
                                      """,
                        },
                    ],
                )
            except Exception:
                logger.error(f"Error generating summary for article {article['url']}: ")
                raise HTTPException(
                    status_code=500, detail="Failed to generate article summary"
                )

            result = json.loads(chat_completion.choices[0].message.content)
            summary = result["summary"]
            why_it_matters = result["why_it_matters"]
            category = result["category"]
            print(chat_completion.choices[0].message.content)
            published_at = datetime.fromisoformat(
                article["publishedAt"].replace("Z", "+00:00")
            )
            db_article = Article(
                title=clean_title(article["title"]),
                url=article["url"],
                content=article.get("content"),
                author=article.get("author"),
                source_id=article.get("source", {}).get("id"),
                source_name=article.get("source", {}).get("name"),
                image_url=article.get("image"),
                description=article.get("description"),
                summary=summary,
                why_it_matters=why_it_matters,
                category=category,
                published_at=published_at,
                source_url=article.get("source", {}).get("url"),
            )

            db.add(db_article)

        if new_articles:
            try:
                await db.commit()
            except Exception as e:
                await db.rollback()
                logger.error("Error committing to database:")
                raise HTTPException(
                    detail=str(e),
                    status_code=500,
                )

        # 5. Return statistics
        return {
            "total_fetched": len(articles),
            "new_articles": len(new_articles),
            "duplicates": len(articles) - len(new_articles),
        }

    async def get_today_summary(self, db: AsyncSession):
        result = await db.execute(
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

        try:
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

        except Exception as e:
            await db.rollback()
            raise HTTPException(
                detail=str(e),
                status_code=500,
            )

        result = json.loads(response.choices[0].message.content)
        return result

    async def get_categories(self):
        return {"it working let go "}

    async def get_news_by_category(self, db: AsyncSession, category: str):
        return {"it working let go "}
