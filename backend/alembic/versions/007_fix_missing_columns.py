"""fix missing columns (idempotent)

Revision ID: 007
Revises: 006
Create Date: 2026-07-02
"""
from alembic import op

revision = "007"
down_revision = "006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS webhook_url VARCHAR(500),
        ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(200),
        ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255)
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT,
            read BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS teams (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT uq_team_owner UNIQUE (owner_id)
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS team_members (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT uq_team_user UNIQUE (team_id, user_id)
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS team_invitations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
            email VARCHAR(255) NOT NULL,
            token VARCHAR(128) NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            expires_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT uq_team_inv_token UNIQUE (token)
        )
    """)

    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_team_invitations_token ON team_invitations (token)
    """)


def downgrade() -> None:
    pass
