import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import (
    Boolean, DateTime, Float, ForeignKey, Integer,
    String, Text, JSON, UniqueConstraint, Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    email_verification_token: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, unique=True)
    webhook_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    subscription: Mapped[Optional["Subscription"]] = relationship("Subscription", back_populates="user", uselist=False)
    user_agents: Mapped[list["UserAgent"]] = relationship("UserAgent", back_populates="user")
    requests: Mapped[list["AgentRequest"]] = relationship("AgentRequest", back_populates="user")


# ---------------------------------------------------------------------------
# Agents
# ---------------------------------------------------------------------------

class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    long_description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    icon: Mapped[str] = mapped_column(String(10), nullable=False, default="🤖")
    price_monthly: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    price_onetime: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    features: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    tags: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    system_prompt: Mapped[str] = mapped_column(Text, nullable=False, default="")
    tools: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    rating: Mapped[float] = mapped_column(Float, nullable=False, default=5.0)
    reviews_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user_agents: Mapped[list["UserAgent"]] = relationship("UserAgent", back_populates="agent")
    requests: Mapped[list["AgentRequest"]] = relationship("AgentRequest", back_populates="agent")


# ---------------------------------------------------------------------------
# Subscriptions
# ---------------------------------------------------------------------------

class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    plan: Mapped[str] = mapped_column(String(50), nullable=False, default="starter")
    stripe_subscription_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")
    current_period_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    current_period_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    cancel_at_period_end: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user: Mapped["User"] = relationship("User", back_populates="subscription")


# ---------------------------------------------------------------------------
# User ↔ Agent access
# ---------------------------------------------------------------------------

class UserAgent(Base):
    __tablename__ = "user_agents"
    __table_args__ = (UniqueConstraint("user_id", "agent_id", name="uq_user_agent"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    agent_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    access_type: Mapped[str] = mapped_column(String(50), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    acquired_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship("User", back_populates="user_agents")
    agent: Mapped["Agent"] = relationship("Agent", back_populates="user_agents")


# ---------------------------------------------------------------------------
# Agent execution logs
# ---------------------------------------------------------------------------

class AgentRequest(Base):
    __tablename__ = "agent_requests"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    agent_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    response: Mapped[str] = mapped_column(Text, nullable=False)
    input_tokens: Mapped[int] = mapped_column(Integer, default=0)
    output_tokens: Mapped[int] = mapped_column(Integer, default=0)
    conversation_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)

    user: Mapped["User"] = relationship("User", back_populates="requests")
    agent: Mapped["Agent"] = relationship("Agent", back_populates="requests")


# ---------------------------------------------------------------------------
# Email integrations (Gmail / Outlook)
# ---------------------------------------------------------------------------

class EmailIntegration(Base):
    __tablename__ = "email_integrations"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider: Mapped[str] = mapped_column(String(20), nullable=False)  # "gmail" | "outlook"
    email_address: Mapped[str] = mapped_column(String(255), nullable=False)
    encrypted_access_token: Mapped[str] = mapped_column(Text, nullable=False)
    encrypted_refresh_token: Mapped[str] = mapped_column(Text, nullable=False)
    token_expiry: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    rules: Mapped[list["AgentRule"]] = relationship("AgentRule", back_populates="integration", cascade="all, delete-orphan")
    jobs: Mapped[list["EmailJob"]] = relationship("EmailJob", back_populates="integration")


class AgentRule(Base):
    __tablename__ = "agent_rules"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    integration_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("email_integrations.id", ondelete="CASCADE"), nullable=False)
    agent_slug: Mapped[str] = mapped_column(String(100), nullable=False)  # ex: "email-writer"
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    trigger: Mapped[str] = mapped_column(String(50), nullable=False)  # "new_email" | "keyword" | "sender"
    trigger_config: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    action: Mapped[str] = mapped_column(String(50), nullable=False)  # "draft" | "send"
    action_config: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    integration: Mapped["EmailIntegration"] = relationship("EmailIntegration", back_populates="rules")
    jobs: Mapped[list["EmailJob"]] = relationship("EmailJob", back_populates="rule")


class EmailJob(Base):
    __tablename__ = "email_jobs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    integration_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("email_integrations.id", ondelete="CASCADE"), nullable=False)
    rule_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), ForeignKey("agent_rules.id", ondelete="SET NULL"), nullable=True)
    email_id: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(500), nullable=False, default="(sans objet)")
    from_address: Mapped[str] = mapped_column(String(255), nullable=False)
    action_taken: Mapped[str] = mapped_column(String(50), nullable=False)  # "drafted" | "sent" | "skipped" | "error"
    ai_response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    processed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)

    integration: Mapped["EmailIntegration"] = relationship("EmailIntegration", back_populates="jobs")
    rule: Mapped[Optional["AgentRule"]] = relationship("AgentRule", back_populates="jobs")


# ---------------------------------------------------------------------------
# Password reset tokens
# ---------------------------------------------------------------------------

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


# ---------------------------------------------------------------------------
# Developer API keys (B14)
# ---------------------------------------------------------------------------

class ApiKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    key_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    key_prefix: Mapped[str] = mapped_column(String(12), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship("User")


# ---------------------------------------------------------------------------
# Notifications (B10)
# ---------------------------------------------------------------------------

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # "email_rule" | "quota_warning" | "info"
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)

    user: Mapped["User"] = relationship("User")


# ---------------------------------------------------------------------------
# Teams (B11)
# ---------------------------------------------------------------------------

class Team(Base):
    __tablename__ = "teams"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    owner: Mapped["User"] = relationship("User", foreign_keys=[owner_id])
    members: Mapped[list["TeamMember"]] = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    invitations: Mapped[list["TeamInvitation"]] = relationship("TeamInvitation", back_populates="team", cascade="all, delete-orphan")


class TeamMember(Base):
    __tablename__ = "team_members"
    __table_args__ = (UniqueConstraint("team_id", "user_id", name="uq_team_user"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    team: Mapped["Team"] = relationship("Team", back_populates="members")
    user: Mapped["User"] = relationship("User")


class TeamInvitation(Base):
    __tablename__ = "team_invitations"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    token: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending | accepted | declined
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    team: Mapped["Team"] = relationship("Team", back_populates="invitations")


# ---------------------------------------------------------------------------
# Monthly usage tracker
# ---------------------------------------------------------------------------

class UsageStat(Base):
    __tablename__ = "usage_stats"
    __table_args__ = (UniqueConstraint("user_id", "year", "month", name="uq_user_month"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    request_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


# ---------------------------------------------------------------------------
# RAG — Knowledge bases & chunks
# ---------------------------------------------------------------------------

class KnowledgeBase(Base):
    __tablename__ = "knowledge_bases"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_slug: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # None = global (all agents)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="processing")  # processing | ready | error
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    chunks: Mapped[list["KnowledgeChunk"]] = relationship("KnowledgeChunk", back_populates="knowledge_base", cascade="all, delete-orphan")


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kb_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("knowledge_bases.id", ondelete="CASCADE"), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)  # stored as JSON list
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    knowledge_base: Mapped["KnowledgeBase"] = relationship("KnowledgeBase", back_populates="chunks")


# ---------------------------------------------------------------------------
# Intent routing
# ---------------------------------------------------------------------------

class IntentRoute(Base):
    __tablename__ = "intent_routes"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    agent_slug: Mapped[str] = mapped_column(String(100), nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


# ---------------------------------------------------------------------------
# Custom system prompts per user per agent
# ---------------------------------------------------------------------------

class AgentCustomPrompt(Base):
    __tablename__ = "agent_custom_prompts"
    __table_args__ = (UniqueConstraint("user_id", "agent_slug", name="uq_user_agent_prompt"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_slug: Mapped[str] = mapped_column(String(100), nullable=False)
    system_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


# ---------------------------------------------------------------------------
# Webhook triggers (Phase 3)
# ---------------------------------------------------------------------------

class WebhookTrigger(Base):
    __tablename__ = "webhook_triggers"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_slug: Mapped[str] = mapped_column(String(100), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    secret_token: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_triggered_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship("User")


# ---------------------------------------------------------------------------
# Scheduled runs (Phase 3)
# ---------------------------------------------------------------------------

class ScheduledRun(Base):
    __tablename__ = "scheduled_runs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_slug: Mapped[str] = mapped_column(String(100), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    cron_expression: Mapped[str] = mapped_column(String(100), nullable=False)
    prompt_template: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_run_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    next_run_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship("User")
