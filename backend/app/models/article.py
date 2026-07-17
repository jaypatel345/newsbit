from sqlalchemy import Column, Integer, String, Text, DateTime, func
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True)

    title = Column(String(255), nullable=False)
    description = Column(Text)
    content = Column(Text)

    summary = Column(Text)

    author = Column(Text)

    source_id = Column(String(100))
    source_name = Column(String(255))

    url = Column(String(500), unique=True)
    image_url = Column(String(500))

    published_at = Column(DateTime(timezone=True), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self):
        return f"<Article(id={self.id}, title='{self.title}')>"
