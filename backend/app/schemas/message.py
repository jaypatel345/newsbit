from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class SendMessageRequest(BaseModel):

    content: str
    article_ids: list[int] = []


class MessageResponse(BaseModel):

    id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime


class MessageListResponse(BaseModel):

    messages: list[MessageResponse]


class MessageRole(str, Enum):

    USER = "user"
    ASSISTANT = "assistant"
