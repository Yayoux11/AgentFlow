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
