"""add summary_audio table

Revision ID: e4f6a8b0c2d5
Revises: d3e5f7a9b2c4
Create Date: 2026-09-13 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "e4f6a8b0c2d5"
down_revision: str | Sequence[str] | None = "d3e5f7a9b2c4"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add the cached TTS audio table for the home page's daily brief."""
    op.create_table(
        "summary_audio",
        sa.Column("summary_id", sa.Integer(), nullable=False),
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
            ["summary_id"], ["summaries.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("summary_id"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("summary_audio")
