from app.core.config import settings
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from groq import AsyncGroq
from datetime import datetime
from app.models.article import Article
from app.prompts.news import NEWS_SUMMARY_PROMPT
import logging
from fastapi import HTTPException

groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
logger = logging.getLogger(__name__)


def clean_title(title: str) -> str:
    if " - " in title:
        return title.rsplit(" - ", 1)[0]
    return title


class NewsService:

    async def get_latest_news(self, db: AsyncSession):
        try:
            result = await db.execute(
                select(Article.title, Article.summary, Article.url)
                .order_by(Article.published_at.desc())
                .limit(10)
            )

            articles = [
                {
                    "title": title,
                    "summary": summary,
                    "url": url,
                }
                for title, summary, url in result.all()
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
                    settings.NEWS_API_URL,
                    params={"country": "us", "apiKey": settings.NEWS_API_KEY},
                )
                response.raise_for_status()
                articles = response.json().get("articles", [])
        except Exception:
            logger.error("Error fetching news from external API")
            raise HTTPException(
                status_code=502, detail="Failed to fetch news from external API"
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

            summary = chat_completion.choices[0].message.content

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
                image_url=article.get("urlToImage"),
                description=article.get("description"),
                summary=summary,
                published_at=published_at,
            )

            db.add(db_article)

        if new_articles:
            try:
                await db.commit()
            except Exception:
                await db.rollback()
                logger.error("Error committing to database:")
                raise HTTPException(
                    status_code=500, detail="Failed to commit articles to database"
                )

        # 5. Return statistics
        return {
            "total_fetched": len(articles),
            "new_articles": len(new_articles),
            "duplicates": len(articles) - len(new_articles),
        }
