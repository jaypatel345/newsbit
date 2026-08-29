"""add_article_performance_indexes

Revision ID: add_article_performance_indexes
Revises: 0c7e61a30c1b
Create Date: 2026-08-12 00:00:00.000000

"""
from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'add_article_performance_indexes'
down_revision: str | Sequence[str] | None = '9e037f67f9ef'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add composite index for top stories query (popularity_score + published_at)
    # This is more efficient than separate indexes for the ORDER BY clause
    op.create_index('idx_articles_popularity_published', 'articles', ['popularity_score', 'published_at'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('idx_articles_popularity_published', 'articles')
