"""add multi-turn memory, tools per agent, webhook triggers, scheduled runs

Revision ID: 009
Revises: 008
Create Date: 2026-07-02
"""
from alembic import op
import sqlalchemy as sa

revision = "009"
down_revision = "008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Phase 1 — conversation_id on agent_requests
    op.add_column("agent_requests", sa.Column("conversation_id", sa.Uuid(as_uuid=True), nullable=True))
    op.create_index("ix_agent_requests_conversation_id", "agent_requests", ["conversation_id"])

    # Phase 2 — tools list on agents
    op.add_column("agents", sa.Column("tools", sa.JSON(), nullable=True, server_default="[]"))

    # Phase 3 — webhook_triggers
    op.create_table(
        "webhook_triggers",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Uuid(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("agent_slug", sa.String(100), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("secret_token", sa.String(64), nullable=False, unique=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("last_triggered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_webhook_triggers_user_id", "webhook_triggers", ["user_id"])
    op.create_index("ix_webhook_triggers_secret_token", "webhook_triggers", ["secret_token"], unique=True)

    # Phase 3 — scheduled_runs
    op.create_table(
        "scheduled_runs",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Uuid(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("agent_slug", sa.String(100), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("cron_expression", sa.String(100), nullable=False),
        sa.Column("prompt_template", sa.Text(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("last_run_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("next_run_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_scheduled_runs_user_id", "scheduled_runs", ["user_id"])


def downgrade() -> None:
    op.drop_table("scheduled_runs")
    op.drop_table("webhook_triggers")
    op.drop_column("agents", "tools")
    op.drop_index("ix_agent_requests_conversation_id", table_name="agent_requests")
    op.drop_column("agent_requests", "conversation_id")
