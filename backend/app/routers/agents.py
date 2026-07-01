import csv
import io
import uuid
from datetime import datetime, timezone
from typing import List, Optional

import anthropic
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.deps import get_current_user, get_db, require_superuser
from app.models import Agent, AgentRequest, Subscription, UsageStat
from app.schemas import AgentCreate, AgentOut, AgentRunRequest, AgentRunResponse, AgentUpdate, ConversationItemOut, MessageResponse
from app.models import User

router = APIRouter(prefix="/agents", tags=["agents"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _get_usage_this_month(user_id: uuid.UUID, db: AsyncSession) -> int:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(UsageStat).where(UsageStat.user_id == user_id, UsageStat.year == now.year, UsageStat.month == now.month)
    )
    stat = result.scalar_one_or_none()
    return stat.request_count if stat else 0


async def _increment_usage(user_id: uuid.UUID, db: AsyncSession) -> None:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(UsageStat).where(UsageStat.user_id == user_id, UsageStat.year == now.year, UsageStat.month == now.month)
    )
    stat = result.scalar_one_or_none()
    if stat:
        stat.request_count += 1
    else:
        db.add(UsageStat(user_id=user_id, year=now.year, month=now.month, request_count=1))


async def _can_access_agent(user: User, agent: Agent, db: AsyncSession) -> bool:
    """Superuser always OK. Otherwise check subscription plan."""
    if user.is_superuser:
        return True

    result = await db.execute(select(Subscription).where(Subscription.user_id == user.id))
    sub = result.scalar_one_or_none()
    if not sub or sub.status not in ("active", "trialing"):
        return False

    if sub.plan in ("pro", "enterprise"):
        return True

    # starter: check active agent count
    from app.models import UserAgent
    active_count_result = await db.execute(
        select(func.count()).select_from(UserAgent).where(UserAgent.user_id == user.id, UserAgent.is_active == True)
    )
    count = active_count_result.scalar_one()
    limit = settings.PLAN_LIMITS["starter"]["max_agents"]
    return count < limit


# ---------------------------------------------------------------------------
# Public endpoints
# ---------------------------------------------------------------------------

@router.get("", response_model=List[AgentOut])
async def list_agents(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = select(Agent).where(Agent.is_active == True)
    if category:
        q = q.where(Agent.category == category)
    if search:
        like = f"%{search}%"
        q = q.where(Agent.name.ilike(like) | Agent.description.ilike(like))
    result = await db.execute(q.order_by(Agent.reviews_count.desc()))
    return result.scalars().all()


@router.get("/{slug}", response_model=AgentOut)
async def get_agent(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Agent).where(Agent.slug == slug, Agent.is_active == True))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


# ---------------------------------------------------------------------------
# Demo run — no auth, haiku model, capped at 600 tokens (B19)
# ---------------------------------------------------------------------------

@router.post("/{slug}/demo", response_model=AgentRunResponse)
async def demo_run_agent(slug: str, body: AgentRunRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Agent).where(Agent.slug == slug, Agent.is_active == True))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if not settings.ANTHROPIC_API_KEY:
        return AgentRunResponse(
            response=f"[DEMO] {agent.name} a bien reçu votre demande. Configurez ANTHROPIC_API_KEY pour activer les vraies réponses IA.",
            input_tokens=0, output_tokens=0, agent_name=agent.name,
        )

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=600,
        system=agent.system_prompt + "\n\nNote: tu es en mode démonstration, garde ta réponse concise (max 3 paragraphes).",
        messages=[{"role": "user", "content": body.prompt}],
    )
    return AgentRunResponse(
        response=message.content[0].text,
        input_tokens=message.usage.input_tokens,
        output_tokens=message.usage.output_tokens,
        agent_name=agent.name,
    )


# Run agent (requires auth + subscription)
# ---------------------------------------------------------------------------

@router.post("/{slug}/run", response_model=AgentRunResponse)
async def run_agent(
    slug: str,
    body: AgentRunRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Fetch agent
    result = await db.execute(select(Agent).where(Agent.slug == slug, Agent.is_active == True))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Access check
    if not await _can_access_agent(current_user, agent, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Subscription required to use this agent")

    # Quota check (skip for superuser and enterprise)
    if not current_user.is_superuser:
        sub_result = await db.execute(select(Subscription).where(Subscription.user_id == current_user.id))
        sub = sub_result.scalar_one_or_none()
        plan = sub.plan if sub else "starter"
        limit = settings.PLAN_LIMITS.get(plan, {}).get("max_requests", 1000)
        if limit != -1:
            usage = await _get_usage_this_month(current_user.id, db)
            if usage >= limit:
                raise HTTPException(status_code=429, detail=f"Monthly quota reached ({limit} requests). Upgrade your plan.")

    # Call Claude
    if not settings.ANTHROPIC_API_KEY:
        # Stub response for dev without API key
        ai_response = f"[STUB] Agent '{agent.name}' received: {body.prompt}\n\nThis is a simulated response. Configure ANTHROPIC_API_KEY to enable real AI responses."
        in_tokens, out_tokens = 0, 0
    else:
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=agent.system_prompt,
            messages=[{"role": "user", "content": body.prompt}],
        )
        ai_response = message.content[0].text
        in_tokens = message.usage.input_tokens
        out_tokens = message.usage.output_tokens

    # Log request + update usage
    log = AgentRequest(
        user_id=current_user.id,
        agent_id=agent.id,
        prompt=body.prompt,
        response=ai_response,
        input_tokens=in_tokens,
        output_tokens=out_tokens,
    )
    db.add(log)
    await _increment_usage(current_user.id, db)

    return AgentRunResponse(response=ai_response, input_tokens=in_tokens, output_tokens=out_tokens, agent_name=agent.name)


# ---------------------------------------------------------------------------
# Conversation history (B8)
# ---------------------------------------------------------------------------

@router.get("/{slug}/history", response_model=List[ConversationItemOut])
async def get_agent_history(
    slug: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Agent).where(Agent.slug == slug, Agent.is_active == True))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    history_result = await db.execute(
        select(AgentRequest)
        .where(AgentRequest.user_id == current_user.id, AgentRequest.agent_id == agent.id)
        .order_by(AgentRequest.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return history_result.scalars().all()


# ---------------------------------------------------------------------------
# Export (B9)
# ---------------------------------------------------------------------------

@router.get("/{slug}/history/export")
async def export_agent_history(
    slug: str,
    format: str = Query("csv", pattern="^(csv)$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Agent).where(Agent.slug == slug, Agent.is_active == True))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    history_result = await db.execute(
        select(AgentRequest)
        .where(AgentRequest.user_id == current_user.id, AgentRequest.agent_id == agent.id)
        .order_by(AgentRequest.created_at.desc())
        .limit(500)
    )
    rows = history_result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_ALL)
    writer.writerow(["Date", "Prompt", "Réponse", "Tokens entrée", "Tokens sortie", "Total tokens"])
    for r in rows:
        writer.writerow([
            r.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            r.prompt,
            r.response,
            r.input_tokens,
            r.output_tokens,
            r.input_tokens + r.output_tokens,
        ])

    output.seek(0)
    filename = f"agentflow_{slug}_{datetime.now(timezone.utc).strftime('%Y%m%d')}.csv"
    return StreamingResponse(
        iter([output.getvalue().encode("utf-8-sig")]),  # utf-8-sig for Excel compatibility
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ---------------------------------------------------------------------------
# Admin CRUD
# ---------------------------------------------------------------------------

@router.post("", response_model=AgentOut, status_code=201, dependencies=[Depends(require_superuser)])
async def create_agent(body: AgentCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Agent).where(Agent.slug == body.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Slug already exists")
    agent = Agent(**body.model_dump())
    db.add(agent)
    await db.commit()
    await db.refresh(agent)
    return agent


@router.patch("/{slug}", response_model=AgentOut, dependencies=[Depends(require_superuser)])
async def update_agent(slug: str, body: AgentUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Agent).where(Agent.slug == slug))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(agent, field, value)
    await db.commit()
    await db.refresh(agent)
    return agent


@router.delete("/{slug}", response_model=MessageResponse, dependencies=[Depends(require_superuser)])
async def delete_agent(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Agent).where(Agent.slug == slug))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent.is_active = False
    await db.commit()
    return MessageResponse(message="Agent deactivated")
