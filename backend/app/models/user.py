from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)

    name = Column(String(100), nullable=False)

    email = Column(String(100), unique=True, nullable=False)

    password_hash = Column(String(255), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"
