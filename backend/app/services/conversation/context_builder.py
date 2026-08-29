class BuildArticle:
    @staticmethod
    def build_article_context(articles):
        context = []

        for index, article in enumerate(articles, start=1):
            # Handle both dict and object formats
            if hasattr(article, "title"):
                title = getattr(article, "title", "No title")
                summary = getattr(article, "summary", "No summary")
                why_it_matters = getattr(article, "why_it_matters", "")
                content = getattr(article, "content", "")
            else:
                title = article.get("title", "No title")
                summary = article.get("summary", "No summary")
                why_it_matters = article.get("why_it_matters", "")
                content = article.get("content", "")

            context.append(
                f"""
            ARTICLE {index}
            Title: {title}
            Summary: {summary}
            Why it matters: {why_it_matters}
            Content: {content}
            """
            )

        return "\n".join(context)
