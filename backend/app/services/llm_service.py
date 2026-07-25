import json
import logging
from app.core.llm import groq_client
from app.prompts.news import NEWS_SUMMARY_PROMPT

logger = logging.getLogger(__name__)


class LLMService:
    async def generate_summary(self, article: dict) -> dict:
        try:
            chat_completion = await groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": NEWS_SUMMARY_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": f"""
                        Title: {article['title']}
                        Description: {article.get('description', '')}
                         Content: {article.get('content', '')}

                         """,
                    },
                ],
            )
            return json.loads(chat_completion.choices[0].message.content)

        except Exception:

            logger.exception(
                "Error generating summary for article: %s",
                article.get("url"),
            )

            raise
