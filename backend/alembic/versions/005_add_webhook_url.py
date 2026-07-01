"""add webhook_url to users

Revision ID: 005
Revises: 004
Create Date: 2026-07-01
"""
from alembic import op
import sqlalchemy as sa

revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("webhook_url", sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "webhook_url")
