from app.core.llm import groq_client
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.prompts.news import NEWSBIT_CHAT_PROMPT
from app.schemas.conversation import CreateConversationRequest
from app.services.ai.llm_service import LLMService
from app.services.conversation.context_builder import BuildArticle
from app.services.news.article_service import ArticleService
from app.services.search.search_service import SearchService
from fastapi import HTTPException
from sqlalchemy import UUID, func, select
from sqlalchemy.ext.asyncio import AsyncSession

try:
    from app.services.ai.semantic_search_service import SemanticSearchService
    from app.tools.semantic_search import SEMANTIC_SEARCH_TOOL

    SEMANTIC_SEARCH_AVAILABLE = True
except ImportError:
    SEMANTIC_SEARCH_AVAILABLE = False
    SemanticSearchService = None
    SEMANTIC_SEARCH_TOOL = None


class ConversationService:
    def __init__(
        self,
        db: AsyncSession,
        article_service: ArticleService,
        llm_service: LLMService,
        search_service: SearchService,
        semantic_search_service: SemanticSearchService = None,
    ):
        self.db = db
        self.article_service = article_service
        self.llm_service = llm_service
        self.search_service = search_service
        self.semantic_search_service = semantic_search_service

    async def get_conversations(
        self, current_user: User | None, guest_id: str | None
    ) -> list:
        if current_user is not None:
            result = await self.db.execute(
                select(Conversation)
                .where(Conversation.user_id == current_user.id)
                .order_by(
                    Conversation.is_pinned.desc(),
                    Conversation.updated_at.desc(),
                )
            )
        elif guest_id is not None:
            result = await self.db.execute(
                select(Conversation)
                .where(Conversation.guest_id == guest_id)
                .order_by(
                    Conversation.is_pinned.desc(),
                    Conversation.updated_at.desc(),
                )
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Either user authentication or guest ID is required",
            )

        return result.scalars().all()

        # Return empty list instead of 404 when no conversations exist

    async def create_conversation(
        self,
        request: CreateConversationRequest,
        current_user: User | None,
        guest_id: str | None,
    ) -> Conversation:

        conversation = Conversation(
            title=request.title,
        )

        if current_user is not None:
            conversation.user_id = current_user.id
        elif guest_id is not None:
            conversation.guest_id = guest_id
        else:
            raise HTTPException(
                status_code=400,
                detail="Either user authentication or guest ID is required",
            )

        self.db.add(conversation)
        await self.db.commit()
        await self.db.refresh(conversation)

        return conversation

    async def update_conversation(
        self,
        request,
        conversation_id,
        current_user: User | None = None,
        guest_id: str | None = None,
    ):
        if current_user is not None:
            conversation_exists = await self.db.execute(
                select(Conversation).where(
                    Conversation.id == conversation_id,
                    Conversation.user_id == current_user.id,
                )
            )
        elif guest_id is not None:
            conversation_exists = await self.db.execute(
                select(Conversation).where(
                    Conversation.id == conversation_id,
                    Conversation.guest_id == guest_id,
                )
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Either user authentication or guest ID is required",
            )

        result = conversation_exists.scalar_one_or_none()

        if result is None:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found",
            )

        conversation = result

        if request.title is not None:
            conversation.title = request.title

        if request.is_pinned is not None:
            conversation.is_pinned = request.is_pinned

        await self.db.commit()
        await self.db.refresh(conversation)

        return conversation

    async def delete_conversation(
        self,
        conversation_id,
        current_user: User | None = None,
        guest_id: str | None = None,
    ):
        if current_user is not None:
            result = await self.db.execute(
                select(Conversation).where(
                    Conversation.id == conversation_id,
                    Conversation.user_id == current_user.id,
                )
            )
        elif guest_id is not None:
            result = await self.db.execute(
                select(Conversation).where(
                    Conversation.id == conversation_id,
                    Conversation.guest_id == guest_id,
                )
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Either user authentication or guest ID is required",
            )

        conversation = result.scalar_one_or_none()

        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found",
            )

        await self.db.delete(conversation)
        await self.db.commit()

        return {"message": "Conversation deleted successfully"}

    async def get_messages(
        self, conversation_id, current_user: User | None, guest_id: str | None
    ):
        if current_user is not None:
            conversation = await self.db.scalar(
                select(Conversation).where(
                    Conversation.id == conversation_id,
                    Conversation.user_id == current_user.id,
                )
            )
        elif guest_id is not None:
            conversation = await self.db.scalar(
                select(Conversation).where(
                    Conversation.id == conversation_id,
                    Conversation.guest_id == guest_id,
                )
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Either user authentication or guest ID is required",
            )

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        result = await self.db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at)
        )

        messages = result.scalars().all()
        # Transform to match MessageResponse schema
        return [
            {
                "id": msg.id,
                "conversation_id": msg.conversation_id,
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at,
            }
            for msg in messages
        ]

    async def send_message(
        self,
        request,
        conversation_id,
        current_user: User | None,
        guest_id: str | None,
    ):
        # 1. Verify the conversation exists.
        if current_user is not None:
            result = await self.db.execute(
                select(Conversation).where(
                    Conversation.id == conversation_id,
                    Conversation.user_id == current_user.id,
                )
            )
        elif guest_id is not None:
            result = await self.db.execute(
                select(Conversation).where(
                    Conversation.id == conversation_id,
                    Conversation.guest_id == guest_id,
                )
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Either user authentication or guest ID is required",
            )

        conversation = result.scalar_one_or_none()

        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found",
            )

        # 2. Save the user's message.
        user_message = Message(
            conversation_id=conversation_id,
            role="user",
            content=request.content,
        )

        self.db.add(user_message)
        await self.db.commit()
        await self.db.refresh(user_message)

        # 3. Fetch articles if provided or if user asks for news summary
        article = []
        user_content_lower = user_message.content.lower()

        # Check if user is asking for news/summary/headlines
        news_keywords = [
            "news",
            "headlines",
            "top stories",
            "today",
            "latest",
            "breaking",
            "trending",
        ]
        should_fetch_news = any(
            keyword in user_content_lower for keyword in news_keywords
        )

        if request.article_ids:
            # Fetch articles from the provided IDs
            for article_id in request.article_ids:
                article_data = await self.article_service.get_article_by_id(article_id)
                if article_data:
                    article.append(article_data)
        elif should_fetch_news:
            # Auto-fetch recent news articles for news-related queries
            from datetime import UTC, datetime, timedelta

            from app.models.article import Article
            from sqlalchemy import desc

            # Get articles from the last 24 hours
            today = datetime.now(UTC) - timedelta(hours=24)
            result = await self.db.execute(
                select(Article)
                .where(
                    Article.summary.is_not(None),
                    Article.published_at >= today,
                    Article.image_url.is_not(None),
                    Article.image_url != "",
                )
                .order_by(desc(Article.popularity_score), desc(Article.published_at))
                .limit(10)
            )
            recent_articles = result.scalars().all()

            # Add articles directly - they're already Article objects with the right attributes
            article.extend(recent_articles)

        article_context = (
            BuildArticle.build_article_context(article) if article else None
        )

        # 4. Build messages for LLM
        system_content = NEWSBIT_CHAT_PROMPT

        if article_context:
            system_content += (
                f"\n\nHere is some relevant article context:\n{article_context}"
            )

        messages = [
            {
                "role": "system",
                "content": system_content,
            },
            {
                "role": "user",
                "content": user_message.content,
            },
        ]

        # 5. Call the LLM
        try:
            chat_completion = await groq_client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=messages,
            )

            message = chat_completion.choices[0].message
            llm_result = message.content
        except Exception as e:
            print(f"Error calling LLM: {e}")
            print(f"Messages sent: {messages}")
            raise e

        # 6. Save the assistant's reply.
        assistant_message = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=llm_result,
        )

        self.db.add(assistant_message)

        # 8. Update the conversation timestamp.
        conversation.updated_at = func.now()

        await self.db.commit()

        await self.db.refresh(assistant_message)
        await self.db.refresh(conversation)

        # 9. Return the assistant message.
        return {
            "id": assistant_message.id,
            "conversation_id": assistant_message.conversation_id,
            "role": assistant_message.role,
            "content": assistant_message.content,
            "created_at": assistant_message.created_at,
        }

    async def clear_messages(self, conversation_id):
        pass

    async def migrate_guest_conversations(
        self,
        guest_id: str,
        user_id: UUID,
    ):
        result = await self.db.execute(
            select(Conversation).where(
                Conversation.guest_id == guest_id,
                Conversation.user_id.is_(None),
            )
        )

        conversations = result.scalars().all()

        for conversation in conversations:
            conversation.user_id = user_id
            conversation.guest_id = None

        await self.db.commit()
