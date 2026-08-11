SEMANTIC_SEARCH_TOOL = {
    "type": "function",
    "function": {
        "name": "semantic_search",
        "description": (
            "Search news articles using semantic similarity. "
            "Use this when metadata or keyword search is insufficient "
            "to answer the user's question, especially when the question "
            "is conceptual or uses different wording than the articles."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": (
                        "A natural-language search query describing "
                        "the information to find in the news articles."
                    ),
                },
                "top_k": {
                    "type": "integer",
                    "description": "Number of relevant articles to retrieve.",
                    "default": 5,
                    "minimum": 1,
                    "maximum": 10,
                },
            },
            "required": ["query"],
        },
    },
}
