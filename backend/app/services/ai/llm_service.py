import json
import logging

from app.core.llm import groq_client
from app.prompts.news import NEWS_SUMMARY_PROMPT
from app.prompts.sufficient_prompt import SUFFICIENT_PROMPT

logger = logging.getLogger(__name__)


class LLMService:
    async def generate_summary(self, article: dict) -> dict:
        try:
            chat_completion = await groq_client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[
                    {
                        "role": "system",
                        "content": NEWS_SUMMARY_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": f"""
						Title: {article["title"]}
						Description: {article.get("description", "")}
						Content: {article.get("content", "")}

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

    async def generate(
        self,
        prompt: str,
        model: str = "openai/gpt-oss-120b",
        temperature: float = 0.0,
    ) -> str:

        try:
            chat_completion = await groq_client.chat.completions.create(
                model=model,
                temperature=temperature,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
            )

            return chat_completion.choices[0].message.content.strip()

        except Exception:
            logger.exception("Error generating LLM response")
            raise

    async def context_sufficiency(self, article_context: list[str]) -> bool:
        try:
            chat_completion = await groq_client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[
                    {
                        "role": "system",
                        "content": SUFFICIENT_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": article_context,
                    },
                ],
            )
            return chat_completion.choices[0].message.content

        except Exception:
            logger.exception(
                "Error generating prompt is sufficient or not : %s",
                article_context,
            )
            raise
