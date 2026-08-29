"""add_entities_processed_to_articles

Revision ID: 0e077523d0c4
Revises: e31fb43ef513
Create Date: 2026-08-05 20:28:45.235941

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '0e077523d0c4'
down_revision: str | Sequence[str] | None = 'e31fb43ef513'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('articles', sa.Column('entities_processed', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('articles', 'entities_processed')
