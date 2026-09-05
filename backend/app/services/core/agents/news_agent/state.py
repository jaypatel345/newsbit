from typing import Annotated, TypedDict

from langgraph.graph.message import add_messages


class NewsAgentState(TypedDict):
    messages: Annotated[list, add_messages]
    search_results: list
    tool_calls: list[str]
