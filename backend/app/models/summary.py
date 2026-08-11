from app.db.database import Base
from sqlalchemy import Column, DateTime, Integer, String, Text, func


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)

    headline = Column(String(255), nullable=False)
    theme = Column(Text, nullable=False)

    # Store JSON as text
    summary_json = Column(Text, nullable=False)
    key_takeaways_json = Column(Text, nullable=False)
    categories_json = Column(Text, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self):
        return f"<Summary(id={self.id}, headline='{self.headline}')>"
