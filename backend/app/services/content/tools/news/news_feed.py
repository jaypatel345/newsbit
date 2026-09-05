from app.services.content.news.news_feed_service import NewsFeedService
from langchain_core.tools import tool


def create_news_feed_tools(db):
    news_feed_service = NewsFeedService(db)

    @tool
    async def get_top_stories():
        """
        Get the top news stories of today.

        ALWAYS use this tool when the user asks for today's top news,
        top headlines, latest important news, or a quick overview
        of what is happening today.
        """
        articles = await news_feed_service.get_top_stories(limit=10)

        if not articles:
            return "No top stories found."

        formatted_results = []

        for article in articles:
            formatted_results.append(  # noqa: PERF401
                f"Title: {article.title}\n"
                f"Summary: {article.summary}\n"
                f"Source: {article.source_name}\n"
                f"Published: {article.published_at}\n"
                f"URL: {article.url}"
            )

        return "\n\n".join(formatted_results)

    @tool
    async def get_trending_topics():
        """
        Get currently trending news.

        ALWAYS use this tool when the user asks what is trending,
        which news is getting attention, or what topics are popular
        right now.
        """
        articles = await news_feed_service.get_trending_topics(limit=10)

        if not articles:
            return "No trending news found."

        formatted_results = []

        for article in articles:
            formatted_results.append(  # noqa: PERF401
                f"Title: {article.title}\n"
                f"Summary: {article.summary}\n"
                f"Source: {article.source_name}\n"
                f"Published: {article.published_at}\n"
                f"URL: {article.url}"
            )

        return "\n\n".join(formatted_results)

    @tool
    async def get_category_news(category: str):
        """
        Get news by category.

        ALWAYS use this tool when the user asks for news from a specific category
        like technology, business, sports, entertainment, health, science, politics, world, etc.
        """
        articles = await news_feed_service.get_category_news(
            category=category, limit=10
        )

        if not articles:
            return f"No news found for category: {category}"

        formatted_results = []

        for article in articles:
            formatted_results.append(  # noqa: PERF401
                f"Title: {article.title}\n"
                f"Summary: {article.summary}\n"
                f"Source: {article.source_name}\n"
                f"Published: {article.published_at}\n"
                f"URL: {article.url}"
            )

        return "\n\n".join(formatted_results)

    return [
        get_top_stories,
        get_trending_topics,
        get_category_news,
    ]
