"""add_normalized_name_to_entities

Revision ID: add_normalized_name
Revises: 50fb3f688ad4
Create Date: 2026-08-06 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'add_normalized_name'
down_revision: str | Sequence[str] | None = '50fb3f688ad4'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add normalized_name column as nullable first
    op.add_column('entities', sa.Column('normalized_name', sa.String(), nullable=True))

    # Backfill normalized_name for existing entities
    connection = op.get_bind()
    # Use PostgreSQL-specific function to normalize: lowercase and remove non-alphanumeric chars except spaces
    connection.execute(sa.text("UPDATE entities SET normalized_name = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9\\s]', '', 'g')) WHERE normalized_name IS NULL"))

    # Make the column not nullable after backfilling
    op.alter_column('entities', 'normalized_name', nullable=False)

    # Create index on normalized_name
    op.create_index('idx_entities_normalized_name', 'entities', ['normalized_name'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('idx_entities_normalized_name', 'entities')
    op.drop_column('entities', 'normalized_name')
