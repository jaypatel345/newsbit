from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.conversation import Conversation
from app.models.message import Message
from fastapi import HTTPException
from app.core.llm import groq_client
from sqlalchemy import func


class ConversationService:

    def __init__(self, db: AsyncSession):

        self.db = db

    async def get_conversations(self) -> list:
        result = await self.db.execute(
            select(Conversation).order_by(
                Conversation.is_pinned.desc(),
                Conversation.updated_at.desc(),
            )
        )
        result = await self.db.execute(...)

        conversations = result.scalars().all()

        return conversations

    async def create_conversation(self, request):
        conversation = Conversation(
            title=request.title,
        )
        self.db.add(conversation)
        await self.db.commit()

        await self.db.refresh(conversation)

        return conversation

    async def update_conversation(self, request, conversation_id):
        conversation_exists = await self.db.execute(
            select(Conversation).where(Conversation.id == conversation_id)
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

    async def delete_conversation(self, conversation_id):
        result = await self.db.execute(
            select(Conversation).where(Conversation.id == conversation_id)
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

    async def get_messages(self, conversation_id):
        result = await self.db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at)
        )

        messages = result.scalars().all()

        return messages

    async def send_message(self, request, conversation_id):
        # 1. Verify the conversation exists.
        result = await self.db.execute(
            select(Conversation).where(Conversation.id == conversation_id)
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
