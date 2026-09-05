from app.services.core.agents.news_agent.nodes import NewsAgentNodes
from app.services.core.agents.news_agent.state import NewsAgentState
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import tools_condition


def create_news_graph(db):

    nodes = NewsAgentNodes(db=db)
    graph = StateGraph(NewsAgentState)

    # Add nodes
    graph.add_node("llm", nodes.llm_node)
    graph.add_node("tools", nodes.tools_node)

    # START → LLM
    graph.add_edge(START, "llm")

    # LLM decides:
    # - END if no tool is needed
    # - tools if it wants to call search_news
    graph.add_conditional_edges(
        "llm",
        tools_condition,
        {
            "tools": "tools",
            END: END,
        },
    )

    # After tool execution → LLM
    graph.add_edge("tools", "llm")

    return graph.compile()
