import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------

class UserOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    email: str
    full_name: Optional[str]
    is_superuser: bool
    is_active: bool
    email_verified: bool
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    is_active: Optional[bool] = None


# ---------------------------------------------------------------------------
# Agent
# ---------------------------------------------------------------------------

class AgentOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    slug: str
    name: str
    description: str
    long_description: str
    category: str
    icon: str
    price_monthly: float
    price_onetime: float
    features: List[str]
    tags: List[str]
    rating: float
    reviews_count: int
    is_active: bool
    created_at: datetime


class AgentCreate(BaseModel):
    slug: str
    name: str
    description: str
    long_description: str
    category: str
    icon: str = "🤖"
    price_monthly: float
    price_onetime: float
    features: List[str] = []
    tags: List[str] = []
    system_prompt: str = ""
    rating: float = 5.0
    reviews_count: int = 0


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    long_description: Optional[str] = None
    category: Optional[str] = None
    icon: Optional[str] = None
    price_monthly: Optional[float] = None
    price_onetime: Optional[float] = None
    features: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    system_prompt: Optional[str] = None
    is_active: Optional[bool] = None


class AgentRunResponse(BaseModel):
    response: str
    input_tokens: int
    output_tokens: int
    agent_name: str


# ---------------------------------------------------------------------------
# Subscription
# ---------------------------------------------------------------------------

class SubscriptionOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    plan: str
    status: str
    current_period_end: Optional[datetime]
    cancel_at_period_end: bool


class CheckoutSessionRequest(BaseModel):
    plan: str = Field(pattern="^(pro|enterprise)$")


class CheckoutSessionResponse(BaseModel):
    checkout_url: str


# ---------------------------------------------------------------------------
# Usage
# ---------------------------------------------------------------------------

class UsageOut(BaseModel):
    request_count: int
    limit: int  # -1 = unlimited
    plan: str


# ---------------------------------------------------------------------------
# Admin stats
# ---------------------------------------------------------------------------

class AdminStatsOut(BaseModel):
    total_users: int
    active_subscriptions: int
    total_requests_today: int
    total_revenue_estimate: float


# ---------------------------------------------------------------------------
# Email integrations
# ---------------------------------------------------------------------------

class EmailIntegrationOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    provider: str
    email_address: str
    is_active: bool
    created_at: datetime


class AgentRuleCreate(BaseModel):
    agent_slug: str = "email-writer"
    name: str = Field(min_length=1, max_length=255)
    trigger: str = Field(pattern="^(new_email|keyword|sender)$")
    trigger_config: dict = {}
    action: str = Field(pattern="^(draft|send)$")
    action_config: dict = {}


class AgentRuleUpdate(BaseModel):
    name: Optional[str] = None
    trigger: Optional[str] = None
    trigger_config: Optional[dict] = None
    action: Optional[str] = None
    action_config: Optional[dict] = None
    is_active: Optional[bool] = None


class AgentRuleOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    integration_id: uuid.UUID
    agent_slug: str
    name: str
    trigger: str
    trigger_config: dict
    action: str
    action_config: dict
    is_active: bool
    created_at: datetime


class EmailJobOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    email_id: str
    subject: str
    from_address: str
    action_taken: str
    ai_response: Optional[str]
    processed_at: datetime


# ---------------------------------------------------------------------------
# Analytics (B5)
# ---------------------------------------------------------------------------

class AgentStatOut(BaseModel):
    slug: str
    name: str
    icon: str
    request_count: int


class RecentActivityOut(BaseModel):
    agent_name: str
    agent_icon: str
    agent_slug: str
    prompt_preview: str
    tokens: int
    created_at: datetime


class AnalyticsOut(BaseModel):
    total_requests: int
    requests_this_month: int
    tokens_this_month: int
    per_agent: List[AgentStatOut]
    recent_activity: List[RecentActivityOut]


# ---------------------------------------------------------------------------
# Conversation history (B8)
# ---------------------------------------------------------------------------

class ConversationItemOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    prompt: str
    response: str
    input_tokens: int
    output_tokens: int
    created_at: datetime


# ---------------------------------------------------------------------------
# Password reset (B7)
# ---------------------------------------------------------------------------

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


# ---------------------------------------------------------------------------
# API Keys (B14)
# ---------------------------------------------------------------------------

class ApiKeyCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class ApiKeyOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    key_prefix: str
    is_active: bool
    last_used_at: Optional[datetime]
    created_at: datetime


class ApiKeyCreatedOut(ApiKeyOut):
    full_key: str


# ---------------------------------------------------------------------------
# Teams (B11)
# ---------------------------------------------------------------------------

class TeamCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class TeamMemberOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    user_id: uuid.UUID
    joined_at: datetime
    email: str = ""
    full_name: Optional[str] = None


class TeamInvitationOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    email: str
    status: str
    created_at: datetime


class TeamOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    created_at: datetime
    members: List[TeamMemberOut] = []
    invitations: List[TeamInvitationOut] = []


class InviteRequest(BaseModel):
    email: EmailStr


# ---------------------------------------------------------------------------
# Knowledge base (RAG)
# ---------------------------------------------------------------------------

class KnowledgeBaseOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    agent_slug: Optional[str]
    name: str
    file_name: str
    chunk_count: int
    status: str
    created_at: datetime


# ---------------------------------------------------------------------------
# Intent Routes
# ---------------------------------------------------------------------------

class IntentRouteCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1)
    agent_slug: str = Field(min_length=1, max_length=100)
    priority: int = 0


class IntentRouteUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    agent_slug: Optional[str] = None
    priority: Optional[int] = None
    is_active: Optional[bool] = None


class IntentRouteOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    description: str
    agent_slug: str
    priority: int
    is_active: bool
    created_at: datetime


# ---------------------------------------------------------------------------
# Custom Prompts
# ---------------------------------------------------------------------------

class AgentCustomPromptUpsert(BaseModel):
    system_prompt: str = Field(min_length=1)


class AgentCustomPromptOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    agent_slug: str
    system_prompt: str
    updated_at: datetime


# ---------------------------------------------------------------------------
# Agent run (extended)
# ---------------------------------------------------------------------------

class AgentRunRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=8000)
    use_rag: bool = True
    use_routing: bool = True


# ---------------------------------------------------------------------------
# Generic
# ---------------------------------------------------------------------------

class MessageResponse(BaseModel):
    message: str
