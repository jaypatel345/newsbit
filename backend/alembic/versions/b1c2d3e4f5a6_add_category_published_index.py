"""add_category_published_index

Revision ID: b1c2d3e4f5a6
Revises: 3d33118dac36
Create Date: 2026-09-10 00:00:00.000000

"""
from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b1c2d3e4f5a6"
down_revision: str | Sequence[str] | None = "3d33118dac36"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    # Speeds up the category feed query
    # (WHERE category = ? ORDER BY published_at DESC LIMIT 10) and the
    # GROUP BY category aggregation used to list available categories.
    op.create_index(
        "idx_articles_category_published",
        "articles",
        ["category", "published_at"],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("idx_articles_category_published", "articles")
