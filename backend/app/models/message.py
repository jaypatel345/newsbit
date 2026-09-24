from app.db.database import Base
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)

    conversation_id = Column(
        Integer,
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
    )

    role = Column(String(20), nullable=False)

    content = Column(Text, nullable=False)

    # The articles the agent's tools actually returned for this reply, as
    # [{title, source, url, published}]. Built server-side from the tool
    # output rather than from the model's text, so a cited link is always a
    # real article the agent read and can never be one it invented.
    sources = Column(JSONB, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    conversation = relationship(
        "Conversation",
        back_populates="messages",
    )
