from app.core.config import settings
from app.prompts.news import NEWSBIT_AGENT_PROMPT
from app.services.content.tools.news.internet_search import (
    create_internet_search_tool,
)
from app.services.content.tools.news.news_feed import (
    create_news_feed_tools,  # noqa: F401
)
from app.services.content.tools.news.search_news import (
    create_search_news_tool,  # noqa: F401
)
from app.services.core.agents.news_agent.state import NewsAgentState
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.prebuilt import ToolNode


class NewsAgentNodes:
    def __init__(self, db):

        # Primary model. max_retries=0 so a rate limit fails over immediately
        # instead of burning the request timeout retrying.
        self.llm = ChatGroq(
            model="openai/gpt-oss-120b",
            temperature=0,
            api_key=settings.GROQ_API_KEY_02,
            max_retries=0,
        )

        # Fallbacks for when the primary model/key is rate limited (Groq's free
        # tier has tight per-model daily token budgets). The smaller model and
        # the second key each have their own budget, so one of these usually
        # still has room. Tool-calling still works on all of them.
        self._fallback_llms = [
            ChatGroq(
                model="openai/gpt-oss-20b",
                temperature=0,
                api_key=settings.GROQ_API_KEY_02,
                max_retries=0,
            ),
            ChatGroq(
                model="openai/gpt-oss-120b",
                temperature=0,
                api_key=settings.GROQ_API_KEY_01,
                max_retries=0,
            ),
            ChatGroq(
                model="openai/gpt-oss-20b",
                temperature=0,
                api_key=settings.GROQ_API_KEY_01,
                max_retries=0,
            ),
        ]

        # Create search tool
        self.search_news_tool = create_search_news_tool(db)

        # Create news feed tools
        self.news_feed_tools = create_news_feed_tools(db)

        # Live internet search (Tavily) - the fallback for when Newsbit's own
        # database (everything above) doesn't have what the user is asking
        # about, e.g. something too recent or outside Newsbit's coverage.
        self.internet_search_tool = create_internet_search_tool()

        # Combine all tools
        self.all_tools = [
            self.search_news_tool,
            *self.news_feed_tools,
            self.internet_search_tool,
        ]

        # Give all tools to the LLM, with the fallbacks bound to the same tools.
        self.llm_with_tools = self.llm.bind_tools(self.all_tools).with_fallbacks(
            [llm.bind_tools(self.all_tools) for llm in self._fallback_llms]
        )

        # Node responsible for executing tool calls
        self.tools = ToolNode(self.all_tools)

    def _convert_to_langchain_messages(self, messages):
        """Convert dict messages to LangChain message objects."""
        langchain_messages = []
        for msg in messages:
            if isinstance(msg, dict):
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role == "system":
                    langchain_messages.append(SystemMessage(content=content))
                elif role == "assistant":
                    langchain_messages.append(AIMessage(content=content))
                else:
                    langchain_messages.append(HumanMessage(content=content))
            else:
                # Already a LangChain message
                langchain_messages.append(msg)
        return langchain_messages

    async def llm_node(self, state: NewsAgentState):
        messages = [
            SystemMessage(content=NEWSBIT_AGENT_PROMPT),
            *self._convert_to_langchain_messages(state["messages"]),
        ]
        response = await self.llm_with_tools.ainvoke(messages)
        return {"messages": [response]}

    async def tools_node(self, state: NewsAgentState):
        return await self.tools.ainvoke(state)
