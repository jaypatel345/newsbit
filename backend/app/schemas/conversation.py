from pydantic import BaseModel
from datetime import datetime


class CreateConversationRequest(BaseModel):
    title: str


class UpdateConversationRequest(BaseModel):

    title: str | None = None
    is_pinned: bool | None = None


class ConversationResponse(BaseModel):

    id: int
    title: str
    is_pinned: bool
    created_at: datetime
    updated_at: datetime


class ConversationListResponse(BaseModel):
    conversations: list[ConversationResponse]
