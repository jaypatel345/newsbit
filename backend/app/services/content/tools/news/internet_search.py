import logging

from app.core.config import settings
from langchain_core.tools import tool

logger = logging.getLogger(__name__)

try:
    from tavily import TavilyClient

    TAVILY_AVAILABLE = True
except ImportError:
    TavilyClient = None
    TAVILY_AVAILABLE = False


def create_internet_search_tool():
    """Build a tool that searches the live internet via Tavily.

    Every other tool in this package (search_news, get_top_stories, ...)
    can only ever answer from Newsbit's own database, which is limited to
    whatever the scheduled ingestion job has already pulled in. This tool
    gives the agent a way to answer questions that fall outside that
    snapshot - very recent events, topics Newsbit's feeds never covered,
    or general facts unrelated to any stored article.
    """

    client = (
        TavilyClient(api_key=settings.TAVILY_API_KEY)
        if TAVILY_AVAILABLE and settings.TAVILY_API_KEY
        else None
    )

    @tool
    async def search_internet_news(query: str):
        """
        Search the live internet for news and information.

        Use this ONLY when search_news, get_top_stories, get_trending_topics
        and get_category_news have already been tried and did not have what
        the user is asking about - for example something too recent to be in
        Newsbit's database yet, a topic Newsbit doesn't cover, or a
        follow-up question that needs information beyond what a stored
        article contains. Do not use this as the first tool for a general
        news question; prefer Newsbit's own database first.
        """
        if client is None:
            return (
                "Internet search is not configured right now. Answer using "
                "only the information already available."
            )

        try:
            response = client.search(
                query=query,
                topic="news",
                max_results=5,
            )
        except Exception as e:
            logger.error(f"Tavily search failed: {e}")
            return "Internet search failed right now. Answer using only the information already available."

        results = response.get("results", [])
        if not results:
            return "No relevant results found on the internet for this query."

        formatted_results = []
        for result in results:
            title = result.get("title", "N/A")
            content = result.get("content", "N/A")
            url = result.get("url", "N/A")
            published_date = result.get("published_date", "N/A")

            formatted_results.append(  # noqa: PERF401
                f"Title: {title}\n"
                f"Summary: {content}\n"
                f"Published: {published_date}\n"
                f"URL: {url}"
            )

        return "\n\n".join(formatted_results)

    return search_internet_news
