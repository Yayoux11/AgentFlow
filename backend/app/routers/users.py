import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.deps import get_current_user, get_db, require_superuser
from app.models import Agent, AgentRequest, User, UsageStat
from app.schemas import AgentStatOut, AnalyticsOut, MessageResponse, RecentActivityOut, UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


# ---------------------------------------------------------------------------
# Analytics (B5)
# ---------------------------------------------------------------------------

@router.get("/me/analytics", response_model=AnalyticsOut)
async def get_my_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)

    # Total requests all time
    total_res = await db.execute(
        select(func.count()).select_from(AgentRequest).where(AgentRequest.user_id == current_user.id)
    )
    total_requests = total_res.scalar_one() or 0

    # Requests + tokens this month — compute boundaries in Python to stay DB-agnostic
    from datetime import datetime as _dt
    month_start = _dt(now.year, now.month, 1, tzinfo=now.tzinfo)
    next_month = now.month % 12 + 1
    next_year = now.year + (1 if now.month == 12 else 0)
    month_end = _dt(next_year, next_month, 1, tzinfo=now.tzinfo)

    month_res = await db.execute(
        select(
            func.count().label("count"),
            func.coalesce(func.sum(AgentRequest.input_tokens + AgentRequest.output_tokens), 0).label("tokens"),
        ).where(
            AgentRequest.user_id == current_user.id,
            AgentRequest.created_at >= month_start,
            AgentRequest.created_at < month_end,
        )
    )
    month_row = month_res.one()
    requests_this_month = month_row.count or 0
    tokens_this_month = int(month_row.tokens or 0)

    # Per-agent stats (top agents by usage)
    per_agent_res = await db.execute(
        select(
            Agent.slug, Agent.name, Agent.icon,
            func.count(AgentRequest.id).label("cnt"),
        )
        .join(AgentRequest, AgentRequest.agent_id == Agent.id)
        .where(AgentRequest.user_id == current_user.id)
        .group_by(Agent.slug, Agent.name, Agent.icon)
        .order_by(func.count(AgentRequest.id).desc())
        .limit(8)
    )
    per_agent = [
        AgentStatOut(slug=r.slug, name=r.name, icon=r.icon, request_count=r.cnt)
        for r in per_agent_res.all()
    ]

    # Recent activity (last 10)
    recent_res = await db.execute(
        select(AgentRequest, Agent)
        .join(Agent, AgentRequest.agent_id == Agent.id)
        .where(AgentRequest.user_id == current_user.id)
        .order_by(AgentRequest.created_at.desc())
        .limit(10)
    )
    recent_activity = [
        RecentActivityOut(
            agent_name=agent.name,
            agent_icon=agent.icon,
            agent_slug=agent.slug,
            prompt_preview=req.prompt[:120] + ("…" if len(req.prompt) > 120 else ""),
            tokens=req.input_tokens + req.output_tokens,
            created_at=req.created_at,
        )
        for req, agent in recent_res.all()
    ]

    return AnalyticsOut(
        total_requests=total_requests,
        requests_this_month=requests_this_month,
        tokens_this_month=tokens_this_month,
        per_agent=per_agent,
        recent_activity=recent_activity,
    )


@router.get("", response_model=List[UserOut], dependencies=[Depends(require_superuser)])
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()


@router.get("/{user_id}", response_model=UserOut)
async def get_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.is_superuser and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: uuid.UUID,
    body: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Only superuser can modify is_active; users can only modify their own profile
    if not current_user.is_superuser and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if body.is_active is not None and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only superuser can enable/disable accounts")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/{user_id}", response_model=MessageResponse, dependencies=[Depends(require_superuser)])
async def disable_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_superuser:
        raise HTTPException(status_code=400, detail="Cannot disable a superuser account")
    user.is_active = False
    await db.commit()
    return MessageResponse(message="User disabled")
