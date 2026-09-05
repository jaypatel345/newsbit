from app.core.config import settings
from app.prompts.news import NEWSBIT_CHAT_PROMPT
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

        self.llm = ChatGroq(
            model="openai/gpt-oss-120b",
            temperature=0,
            api_key=settings.GROQ_API_KEY02,
        )

        # Create search tool
        self.search_news_tool = create_search_news_tool(db)

        # Create news feed tools
        self.news_feed_tools = create_news_feed_tools(db)

        # Combine all tools
        self.all_tools = [
            self.search_news_tool,
            *self.news_feed_tools,
        ]

        # Give all tools to the LLM
        self.llm_with_tools = self.llm.bind_tools(self.all_tools)

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
            SystemMessage(content=NEWSBIT_CHAT_PROMPT),
            *self._convert_to_langchain_messages(state["messages"]),
        ]
        response = await self.llm_with_tools.ainvoke(messages)
        return {"messages": [response]}

    async def tools_node(self, state: NewsAgentState):
        return await self.tools.ainvoke(state)
