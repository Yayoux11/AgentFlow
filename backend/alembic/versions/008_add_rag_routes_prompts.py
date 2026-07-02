"""add RAG knowledge bases, intent routes, custom prompts

Revision ID: 008
Revises: 007
Create Date: 2026-07-02
"""
from alembic import op
import sqlalchemy as sa

revision = "008"
down_revision = "007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE TABLE IF NOT EXISTS knowledge_bases (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, agent_slug VARCHAR(100), name VARCHAR(255) NOT NULL, file_name VARCHAR(255) NOT NULL, chunk_count INTEGER NOT NULL DEFAULT 0, status VARCHAR(20) NOT NULL DEFAULT 'processing', created_at TIMESTAMPTZ NOT NULL DEFAULT now())")
    op.execute("CREATE INDEX IF NOT EXISTS ix_knowledge_bases_user_id ON knowledge_bases (user_id)")

    op.execute("CREATE TABLE IF NOT EXISTS knowledge_chunks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), kb_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE, content TEXT NOT NULL, embedding JSON, chunk_index INTEGER NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())")
    op.execute("CREATE INDEX IF NOT EXISTS ix_knowledge_chunks_kb_id ON knowledge_chunks (kb_id)")

    op.execute("CREATE TABLE IF NOT EXISTS intent_routes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, name VARCHAR(100) NOT NULL, description TEXT NOT NULL, agent_slug VARCHAR(100) NOT NULL, priority INTEGER NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())")
    op.execute("CREATE INDEX IF NOT EXISTS ix_intent_routes_user_id ON intent_routes (user_id)")

    op.execute("CREATE TABLE IF NOT EXISTS agent_custom_prompts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, agent_slug VARCHAR(100) NOT NULL, system_prompt TEXT NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), CONSTRAINT uq_user_agent_prompt UNIQUE (user_id, agent_slug))")
    op.execute("CREATE INDEX IF NOT EXISTS ix_agent_custom_prompts_user_id ON agent_custom_prompts (user_id)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS agent_custom_prompts")
    op.execute("DROP TABLE IF EXISTS intent_routes")
    op.execute("DROP TABLE IF EXISTS knowledge_chunks")
    op.execute("DROP TABLE IF EXISTS knowledge_bases")
