from app.db.database import Base
from sqlalchemy import Column, DateTime, ForeignKey, Integer, LargeBinary, String, func


class SummaryAudio(Base):
    """Cached TTS audio for the home page's daily brief ("Today's Brief").

    Generated once per Summary row (on first "Listen" request) and served
    from here afterwards, same caching strategy as ArticleAudio.
    """

    __tablename__ = "summary_audio"

    summary_id = Column(
        Integer,
        ForeignKey("summaries.id", ondelete="CASCADE"),
        primary_key=True,
    )

    audio_content = Column(LargeBinary, nullable=False)
    mime_type = Column(String(50), nullable=False, default="audio/mpeg")
    voice_name = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<SummaryAudio(summary_id={self.summary_id})>"
