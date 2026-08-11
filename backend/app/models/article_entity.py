from app.db.database import Base
from sqlalchemy import Column, ForeignKey
from sqlalchemy.orm import relationship


class ArticleEntity(Base):

    __tablename__ = "article_entities"

    article_id = Column(
        ForeignKey("articles.id", ondelete="CASCADE"),
        primary_key=True,
    )

    entity_id = Column(
        ForeignKey("entities.id", ondelete="CASCADE"),
        primary_key=True,
    )

    article = relationship("Article", back_populates="article_entities")

    entity = relationship("Entity", back_populates="article_entities")
