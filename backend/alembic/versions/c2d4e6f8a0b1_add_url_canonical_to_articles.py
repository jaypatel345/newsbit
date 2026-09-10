"""add url_canonical to articles

Revision ID: c2d4e6f8a0b1
Revises: b1c2d3e4f5a6
Create Date: 2026-09-10 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c2d4e6f8a0b1"
down_revision: str | Sequence[str] | None = "b1c2d3e4f5a6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add a unique, tracking-free canonical URL used for de-duplication."""
    op.add_column(
        "articles",
        sa.Column("url_canonical", sa.Text(), nullable=True),
    )

    # Backfill existing rows with a SQL approximation of
    # app.utils.dedup.canonicalize_url (scheme -> https, drop www.,
    # strip query/fragment, trim trailing slashes and /amp).
    op.execute(
        r"""
        UPDATE articles
        SET url_canonical = regexp_replace(
            regexp_replace(
                regexp_replace(
                    'https://' || regexp_replace(
                        lower(split_part(split_part(url, '#', 1), '?', 1)),
                        '^https?://(www\.)?', ''
                    ),
                    '/amp/?$', ''
                ),
                '/{2,}', '/', 'g'
            ),
            '/+$', ''
        )
        WHERE url_canonical IS NULL
        """
    )

    # Collapse any pre-existing duplicates onto a single row before the
    # unique index goes on: keep the lowest id per canonical URL.
    op.execute(
        """
        DELETE FROM articles a
        USING articles b
        WHERE a.url_canonical = b.url_canonical
          AND a.id > b.id
        """
    )

    op.create_index(
        "idx_articles_url_canonical",
        "articles",
        ["url_canonical"],
        unique=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("idx_articles_url_canonical", "articles")
    op.drop_column("articles", "url_canonical")
