from app.db.database import Base
from sqlalchemy import Column, DateTime, ForeignKey, Integer, LargeBinary, String, func


class ArticleAudio(Base):
    """Cached TTS audio for an article's summary.

    Generated once per article (on first "Listen" request) and served from
    here afterwards, so repeat listens - by the same or other users - never
    call the TTS provider again.
    """

    __tablename__ = "article_audio"

    article_id = Column(
        Integer,
        ForeignKey("articles.id", ondelete="CASCADE"),
        primary_key=True,
    )

    audio_content = Column(LargeBinary, nullable=False)
    mime_type = Column(String(50), nullable=False, default="audio/mpeg")
    voice_name = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<ArticleAudio(article_id={self.article_id})>"
