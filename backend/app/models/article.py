from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.db.database import Base


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True)

    title = Column(String(255), nullable=False)
    description = Column(Text)
    content = Column(Text)

    summary = Column(Text)
    why_it_matters = Column(Text, nullable=True)

    author = Column(Text)
    category = Column(String(100), nullable=True)

    source_id = Column(String(100))
    source_name = Column(String(255))
    source_url = Column(Text)

    url = Column(String(500), unique=True)
    image_url = Column(String(500))

    published_at = Column(DateTime(timezone=True), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self):
        return f"<Article(id={self.id}, title='{self.title}')>"
