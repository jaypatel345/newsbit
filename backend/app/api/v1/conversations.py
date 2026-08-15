from app.db.database import get_db
from app.models.user import User
from app.schemas.conversation import (
    CreateConversationRequest,
    UpdateConversationRequest,
)
from app.schemas.message import (
    MessageListResponse,
    MessageResponse,
    SendMessageRequest,
)
from app.services.article_service import ArticleService
from app.services.auth_service import (
    get_optional_current_user,
)
from app.services.conversation_service import ConversationService, SEMANTIC_SEARCH_AVAILABLE
from app.services.llm_service import LLMService
from app.services.search_service import SearchService
from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

try:
    from app.services.semantic_search_service import SemanticSearchService
    from app.services.embedding_service import EmbeddingService
except ImportError:
    SemanticSearchService = None
    EmbeddingService = None

router = APIRouter(prefix="/api/v1", tags=["conversation"])


def get_article_service(
    db: AsyncSession = Depends(get_db),
) -> ArticleService:
    return ArticleService(db)


def get_llm_service() -> LLMService:
    return LLMService()


def get_search_service() -> SearchService:
    return SearchService()


def get_conversation_service(
    db: AsyncSession = Depends(get_db),
    article_service: ArticleService = Depends(get_article_service),
    llm_service: LLMService = Depends(get_llm_service),
    search_service: SearchService = Depends(get_search_service),
) -> ConversationService:
    semantic_search_service = None
    if SEMANTIC_SEARCH_AVAILABLE and SemanticSearchService and EmbeddingService:
        try:
            embedding_service = EmbeddingService()
            semantic_search_service = SemanticSearchService(db, embedding_service)
        except ImportError:
            pass  # ML dependencies not available
    return ConversationService(db, article_service, llm_service, search_service, semantic_search_service)


@router.get("/conversations")
async def get_conversations(
    guest_id: str | None = Header(default=None, alias="X-Guest-ID"),
    current_user: User | None = Depends(get_optional_current_user),
    service: ConversationService = Depends(get_conversation_service),
):
    return await service.get_conversations(current_user, guest_id)


@router.post("/conversations")
async def create_conversation(
    request: CreateConversationRequest,
    guest_id: str | None = Header(default=None, alias="X-Guest-ID"),
    current_user: User | None = Depends(get_optional_current_user),
    service: ConversationService = Depends(get_conversation_service),
):

    return await service.create_conversation(request, current_user, guest_id)


@router.patch("/conversations/{conversation_id}")
async def update_conversation(
    request: UpdateConversationRequest,
    conversation_id: int,
    guest_id: str | None = Header(default=None, alias="X-Guest-ID"),
    current_user: User | None = Depends(get_optional_current_user),
    service: ConversationService = Depends(get_conversation_service),
):
    return await service.update_conversation(request, conversation_id, current_user, guest_id)


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    guest_id: str | None = Header(default=None, alias="X-Guest-ID"),
    current_user: User | None = Depends(get_optional_current_user),
    service: ConversationService = Depends(get_conversation_service),
):
    return await service.delete_conversation(conversation_id, current_user, guest_id)


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: int,
    guest_id: str | None = Header(default=None, alias="X-Guest-ID"),
    current_user: User | None = Depends(get_optional_current_user),
    service: ConversationService = Depends(get_conversation_service),

):
    messages = await service.get_messages(conversation_id, current_user, guest_id)
    return MessageListResponse(messages=messages)


@router.post("/conversations/{conversation_id}/messages")
async def send_message(
    request: SendMessageRequest,
    conversation_id: int,
    guest_id: str | None = Header(default=None, alias="X-Guest-ID"),
    current_user: User | None = Depends(get_optional_current_user),
    service: ConversationService = Depends(get_conversation_service),
) -> MessageResponse:

    return await service.send_message(request, conversation_id, current_user, guest_id)


@router.delete("/conversations/{conversation_id}/messages")
async def clear_messages(
    conversation_id: int,
    service: ConversationService = Depends(get_conversation_service),
):

    return await service.clear_messages(conversation_id)
