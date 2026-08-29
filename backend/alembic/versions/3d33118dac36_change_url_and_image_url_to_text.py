"""change_url_and_image_url_to_text

Revision ID: 3d33118dac36
Revises: add_article_performance_indexes
Create Date: 2026-08-14 08:05:23.185888

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '3d33118dac36'
down_revision: str | Sequence[str] | None = 'add_article_performance_indexes'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('articles', 'url',
               existing_type=sa.VARCHAR(length=500),
               type_=sa.Text(),
               existing_nullable=False)
    op.alter_column('articles', 'image_url',
               existing_type=sa.VARCHAR(length=500),
               type_=sa.Text(),
               existing_nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('articles', 'image_url',
               existing_type=sa.Text(),
               type_=sa.VARCHAR(length=500),
               existing_nullable=False)
    op.alter_column('articles', 'url',
               existing_type=sa.Text(),
               type_=sa.VARCHAR(length=500),
               existing_nullable=False)
