"""add article_audio table

Revision ID: d3e5f7a9b2c4
Revises: c2d4e6f8a0b1
Create Date: 2026-09-13 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "d3e5f7a9b2c4"
down_revision: str | Sequence[str] | None = "c2d4e6f8a0b1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add the cached TTS audio table for article summaries."""
    op.create_table(
        "article_audio",
        sa.Column("article_id", sa.Integer(), nullable=False),
        sa.Column("audio_content", sa.LargeBinary(), nullable=False),
        sa.Column(
            "mime_type",
            sa.String(length=50),
            nullable=False,
            server_default="audio/mpeg",
        ),
        sa.Column("voice_name", sa.String(length=100), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["article_id"], ["articles.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("article_id"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("article_audio")
