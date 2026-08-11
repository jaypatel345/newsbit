from app.db.database import Base
from sqlalchemy import Column, DateTime, Integer, String, func
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(String(100), unique=True, index=True, nullable=False)

    password_hash = Column(String(255), nullable=False)

    refresh_token_hash = Column(String(255), nullable=True)

    avatar_url = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    conversations = relationship(
        "Conversation",
        back_populates="user",
    )

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"
