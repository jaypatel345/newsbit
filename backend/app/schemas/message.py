from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel


class SendMessageRequest(BaseModel):

    content: str
    article_ids: list[int] = []


class MessageResponse(BaseModel):

    id: int
    conversation_id: int
    role: str
    content: str
    # Articles the agent's tools returned for this reply, so the source
    # credits stay clickable. Empty for user messages and older replies.
    sources: list[dict] = []
    created_at: datetime


class MessageListResponse(BaseModel):

    messages: list[MessageResponse]


class MessageRole(StrEnum):

    USER = "user"
    ASSISTANT = "assistant"
