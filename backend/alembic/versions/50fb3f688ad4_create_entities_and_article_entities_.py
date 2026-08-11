"""create_entities_and_article_entities_tables

Revision ID: 50fb3f688ad4
Revises: 0e077523d0c4
Create Date: 2026-08-05 20:57:13.819114

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '50fb3f688ad4'
down_revision: Union[str, Sequence[str], None] = '0e077523d0c4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'entities',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.UniqueConstraint('name', 'type', name='uq_entity_name_type'),
    )
    op.create_index('ix_entities_id', 'entities', ['id'])
    op.create_index('ix_entities_name', 'entities', ['name'])
    op.create_index('ix_entities_type', 'entities', ['type'])

    op.create_table(
        'article_entities',
        sa.Column('article_id', sa.Integer(), sa.ForeignKey('articles.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('entity_id', sa.Integer(), sa.ForeignKey('entities.id', ondelete='CASCADE'), primary_key=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('article_entities')
    op.drop_table('entities')
