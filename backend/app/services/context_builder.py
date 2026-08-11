
class BuildArticle:

    @staticmethod
    def build_article_context(articles):
        context = []

        for index, article in enumerate(articles, start=1):
            context.append(
                f"""
            ARTICLE {index}
            Title: {article.title}
            Summary: {article.summary}
            Why it matters: {article.why_it_matters}
            Content: {article.content}
            """
            )

        return "\n".join(context)
