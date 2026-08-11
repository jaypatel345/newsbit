SEARCH_ARTICLES_TOOL = {

    "type": "function",

    "function": {

        "name": "search_articles",

        "description": (

            "Search Newsbit's news database for relevant articles. "
            "Use this proactively when the user asks about news topics, "
            "companies, events, or any information that might be in news articles. "
            "Always search for current news when users ask about recent events."

        ),

        "parameters": {

            "type": "object",

            "properties": {

                "query": {

                    "type": "string",

                    "description": (

                        "The search query describing the news information "
                        "you need to find. Use relevant keywords and entities."

                    ),

                }

            },

            "required": ["query"],

        },

    },

}
