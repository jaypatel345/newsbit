from app.services.content.news.news_feed_service import NewsFeedService
from langchain_core.tools import tool

# Canonical categories stored in the DB, keyed by lowercased aliases the LLM
# tends to produce.
_CATEGORY_ALIASES = {
    "technology": "Technology",
    "tech": "Technology",
    "business": "Business",
    "finance": "Business",
    "markets": "Business",
    "economy": "Business",
    "sports": "Sports",
    "sport": "Sports",
    "politics": "Politics",
    "political": "Politics",
    "entertainment": "Entertainment",
    "science": "Science",
    "health": "Health",
    "world": "World",
    "nation": "Nation",
    "national": "Nation",
    "ai": "AI",
    "artificial intelligence": "AI",
    "education": "Education",
    "space": "Space",
}


def _canonical_category(category: str) -> str:
    key = (category or "").strip().lower()
    return _CATEGORY_ALIASES.get(key, category.strip().title())


# The Groq free tier caps tokens-per-minute, and this text is fed straight
# back into the next LLM call, so keep it compact: a handful of articles with
# a trimmed summary is enough for a chat answer.
_MAX_ARTICLES = 6
_SUMMARY_CHARS = 300


def _format_articles(articles) -> str:
    rows = []
    for article in articles[:_MAX_ARTICLES]:
        summary = (article.summary or "").strip()
        if len(summary) > _SUMMARY_CHARS:
            summary = summary[:_SUMMARY_CHARS].rsplit(" ", 1)[0] + "…"
        rows.append(
            f"Title: {article.title}\n"
            f"Summary: {summary}\n"
            f"Source: {article.source_name}\n"
            f"Published: {article.published_at}\n"
            f"URL: {article.url}"
        )
    return "\n\n".join(rows)


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
        articles = await news_feed_service.get_top_stories(limit=_MAX_ARTICLES)

        if not articles:
            return "No top stories found."

        return _format_articles(articles)

    @tool
    async def get_trending_topics():
        """
        Get currently trending news.

        ALWAYS use this tool when the user asks what is trending,
        which news is getting attention, or what topics are popular
        right now.
        """
        articles = await news_feed_service.get_trending_topics(limit=_MAX_ARTICLES)

        if not articles:
            return "No trending news found."

        return _format_articles(articles)

    @tool
    async def get_category_news(category: str):
        """
        Get the latest news for ONE category.

        Use this whenever the user asks for news about a subject area, e.g.
        "latest AI news", "business headlines today", "tech news", "sports news".

        `category` must be exactly one of:
        Technology, Business, Sports, Politics, Entertainment, Science, Health,
        World, Nation, AI, Education, Space.
        Map common phrasings: "tech" -> Technology, "artificial intelligence" -> AI,
        "markets"/"finance"/"economy" -> Business.
        """
        # The LLM often sends a lowercase or loosely-worded category
        # ("business", "artificial intelligence"); the column stores an exact
        # capitalized value, so normalize before querying.
        normalized_category = _canonical_category(category)

        articles = await news_feed_service.get_category_news(
            category=normalized_category, limit=_MAX_ARTICLES
        )

        if not articles:
            return f"No news found for category: {normalized_category}"

        return _format_articles(articles)

    return [
        get_top_stories,
        get_trending_topics,
        get_category_news,
    ]
