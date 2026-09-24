"""add sources to messages

Revision ID: a7c3f91d4e28
Revises: e4f6a8b0c2d5
Create Date: 2026-09-24

Stores the articles the agent's tools returned for an assistant reply, so the
source credits in a saved answer stay clickable after a reload.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "a7c3f91d4e28"
down_revision: str | Sequence[str] | None = "e4f6a8b0c2d5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "messages",
        sa.Column("sources", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("messages", "sources")
