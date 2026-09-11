import logging

from app.core.llm import groq_client
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.prompts.news import NEWSBIT_CHAT_PROMPT
from app.schemas.conversation import CreateConversationRequest
from app.services.content.news.article_service import ArticleService
from app.services.core.conversation.context_builder import BuildArticle  # noqa: F401
from app.services.infrastructure.ai.embedding_service import EmbeddingService
from app.services.infrastructure.ai.llm_service import LLMService
from app.services.infrastructure.search.search_service import SearchService
from fastapi import HTTPException
from sqlalchemy import UUID, func, select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

try:
    from app.services.core.agents.news_agent.graph import create_news_graph

    LANGGRAPH_AVAILABLE = True
    logger.info("LangGraph import successful")
except ImportError as e:
    LANGGRAPH_AVAILABLE = False
    create_news_graph = None
    logger.error(f"LangGraph import failed: {e}")

try:
    from app.services.infrastructure.ai.semantic_search_service import (
        SemanticSearchService,
    )
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
        embedding_service: EmbeddingService = None,
    ):
        self.db = db
        self.article_service = article_service
        self.llm_service = llm_service
        self.search_service = search_service
        self.semantic_search_service = semantic_search_service
        self.embedding_service = embedding_service

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

        # 2b. Load the earlier turns of this conversation so the assistant
        # keeps context across the same conversation. The message saved above
        # is included, so this list ends with the current user message.
        history_result = await self.db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at)
        )
        conversation_history = [
            {"role": msg.role, "content": msg.content}
            for msg in history_result.scalars().all()
            if msg.content and msg.content.strip()
        ]
        # Keep only the most recent turns to bound the prompt size. The Groq
        # free tier caps tokens-per-minute, so a handful of turns is plenty.
        conversation_history = conversation_history[-8:]

        # 3. Build the LangGraph (if available)
        logger.info(f"LANGGRAPH_AVAILABLE: {LANGGRAPH_AVAILABLE}")
        if LANGGRAPH_AVAILABLE:
            try:
                logger.info("Creating news graph...")
                graph = create_news_graph(db=self.db)
                # 4. Run the graph
                logger.info(f"Running graph with input: {request.content}")
                result = await graph.ainvoke(
                    {
                        "messages": conversation_history,
                        "search_results": [],
                        "tool_calls": [],
                    }
                )
                # 5 Get final assistant response
                llm_result = result["messages"][-1].content
                logger.info(
                    f"Graph execution successful, result length: {len(llm_result)}"
                )
            except Exception as e:
                logger.error(f"Error executing news agent graph: {e}")
                import traceback

                traceback.print_exc()
                # A failed tool query can leave the session in an aborted
                # transaction; clear it before we try to save the reply.
                # The user message is already committed, so nothing is lost.
                await self.db.rollback()
                # Fallback to simple LLM call
                llm_result = await self._safe_fallback_llm_call(conversation_history)
        else:
            # Fallback to simple LLM call when LangGraph is not available
            logger.warning("LangGraph not available, using fallback LLM call")
            llm_result = await self._safe_fallback_llm_call(conversation_history)

        # 5. Save the assistant's reply.
        assistant_message = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=llm_result,
        )

        self.db.add(assistant_message)

        # 6. Update the conversation timestamp.
        conversation.updated_at = func.now()

        await self.db.commit()

        await self.db.refresh(assistant_message)
        await self.db.refresh(conversation)

        # 7. Return the assistant message.
        return {
            "id": assistant_message.id,
            "conversation_id": assistant_message.conversation_id,
            "role": assistant_message.role,
            "content": assistant_message.content,
            "created_at": assistant_message.created_at,
        }

    async def clear_messages(self, conversation_id):
        pass

    async def _fallback_llm_call(self, conversation_history) -> str:
        """Fallback LLM call when retrieval service is not available."""
        if isinstance(conversation_history, str):
            conversation_history = [
                {"role": "user", "content": conversation_history}
            ]
        messages = [
            {
                "role": "system",
                "content": NEWSBIT_CHAT_PROMPT,
            },
            *conversation_history,
        ]
        try:
            chat_completion = await groq_client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=messages,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            logger.error(f"Error in fallback LLM call: {e}")
            raise

    async def _safe_fallback_llm_call(self, conversation_history) -> str:
        """Call the fallback LLM, turning a failure into an HTTPException.

        An unhandled exception here would propagate past FastAPI's CORS
        middleware and come back as a bare 500 with no CORS headers — the
        browser then reports it as a CORS failure, hiding the real cause
        (e.g. a missing/rate-limited Groq key). Raising HTTPException keeps
        the response on the normal, CORS-wrapped path.
        """
        try:
            return await self._fallback_llm_call(conversation_history)
        except Exception as e:
            logger.error(f"Fallback LLM call failed, no response available: {e}")
            raise HTTPException(
                status_code=503,
                detail="The AI service is temporarily unavailable. Please try again shortly.",
            ) from e

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
