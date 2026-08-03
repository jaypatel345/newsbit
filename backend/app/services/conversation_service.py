from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import UUID, select
from app.models.conversation import Conversation
from app.models.message import Message
from fastapi import HTTPException
from app.core.llm import groq_client
from sqlalchemy import func
from app.models.user import User
from app.schemas.conversation import CreateConversationRequest
from typing import Optional


class ConversationService:

    def __init__(self, db: AsyncSession):

        self.db = db

    async def get_conversations(
        self, current_user: Optional[User], guest_id: Optional[str]
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

        conversations = result.scalars().all()

        # Return empty list instead of 404 when no conversations exist
        return conversations

    async def create_conversation(
        self,
        request: CreateConversationRequest,
        current_user: Optional[User],
        guest_id: Optional[str],
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

    async def update_conversation(self, request, conversation_id, current_user: User):
        conversation_exists = await self.db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == current_user.id,
            )
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

    async def delete_conversation(self, conversation_id, current_user: User):
        result = await self.db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == current_user.id,
            )
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
        self, conversation_id, current_user: Optional[User], guest_id: Optional[str]
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

        return messages

    async def send_message(
        self,
        request,
        conversation_id,
        current_user: Optional[User],
        guest_id: Optional[str],
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

        # 3. Call the LLM.
        chat_completion = await groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "xyz",
                },
                {
                    "role": "user",
                    "content": user_message.content,
                },
            ],
        )

        llm_result = chat_completion.choices[0].message.content

        # 4. Save the assistant's reply.
        assistant_message = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=llm_result,
        )

        self.db.add(assistant_message)

        # 5. Update the conversation timestamp.
        conversation.updated_at = func.now()

        await self.db.commit()

        await self.db.refresh(assistant_message)
        await self.db.refresh(conversation)

        # 6. Return the assistant message.
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
