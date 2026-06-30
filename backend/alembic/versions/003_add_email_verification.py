"""add email verification fields to users

Revision ID: 003
Revises: 002
Create Date: 2026-07-01
"""
from alembic import op
import sqlalchemy as sa

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("email_verified", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("users", sa.Column("email_verification_token", sa.String(128), nullable=True))
    op.create_unique_constraint("uq_users_email_verification_token", "users", ["email_verification_token"])


def downgrade() -> None:
    op.drop_constraint("uq_users_email_verification_token", "users", type_="unique")
    op.drop_column("users", "email_verification_token")
    op.drop_column("users", "email_verified")
