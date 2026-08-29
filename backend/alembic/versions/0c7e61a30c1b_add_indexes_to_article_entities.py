"""add_indexes_to_article_entities

Revision ID: 0c7e61a30c1b
Revises: add_normalized_name
Create Date: 2026-08-06 14:21:09.703724

"""
from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '0c7e61a30c1b'
down_revision: str | Sequence[str] | None = 'add_normalized_name'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add indexes to article_entities junction table for performance
    op.create_index('idx_article_entities_entity', 'article_entities', ['entity_id'])
    op.create_index('idx_article_entities_article', 'article_entities', ['article_id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('idx_article_entities_article', 'article_entities')
    op.drop_index('idx_article_entities_entity', 'article_entities')
