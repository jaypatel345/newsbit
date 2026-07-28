from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.conversation_service import ConversationService
from app.schemas.conversation import CreateConversationRequest
from app.schemas.message import SendMessageRequest, MessageResponse

router = APIRouter(prefix="/api/v1", tags=["conversation"])


def get_conversation_service(
    db: AsyncSession = Depends(get_db),
) -> ConversationService:
    return ConversationService(db)


@router.get("/conversations")
async def get_conversations(
    service: ConversationService = Depends(get_conversation_service),
):
    return await service.get_conversations()


@router.post("/conversations")
async def create_conversation(
    request: CreateConversationRequest,
    service: ConversationService = Depends(get_conversation_service),
):

    return await service.create_conversation(request)


@router.patch("/conversations/{conversation_id}")
async def update_conversation(
    request: CreateConversationRequest,
    conversation_id: int,
    service: ConversationService = Depends(get_conversation_service),
):
    return await service.update_conversation(request, conversation_id)


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    service: ConversationService = Depends(get_conversation_service),
):

    return await service.delete_conversation(conversation_id)


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: int,
    service: ConversationService = Depends(get_conversation_service),
):

    return await service.get_messages(conversation_id)


@router.post("/conversations/{conversation_id}/messages")
async def send_message(
    request: SendMessageRequest,
    conversation_id: int,
    service: ConversationService = Depends(get_conversation_service),
) -> MessageResponse:

    return await service.send_message(request, conversation_id)


@router.delete("/conversations/{conversation_id}/messages")
async def clear_messages(
    conversation_id: int,
    service: ConversationService = Depends(get_conversation_service),
):

    return await service.clear_messages(conversation_id)
