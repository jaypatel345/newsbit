from app.db.database import Base
from sqlalchemy import Column, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship


class Entity(Base):
    __tablename__ = "entities"

    __table_args__ = (
        UniqueConstraint(
            "name",
            "type",
            name="uq_entity_name_type",
        ),
        Index("idx_entities_normalized_name", "normalized_name"),
    )

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String,
        nullable=False,
        index=True,
    )

    normalized_name = Column(
        String,
        nullable=False,
        index=True,
    )

    type = Column(
        String,
        nullable=False,
        index=True,
    )

    article_entities = relationship(
        "ArticleEntity",
        back_populates="entity",
        cascade="all, delete-orphan",
    )
