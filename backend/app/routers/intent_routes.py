"""Intent routes and custom prompts management."""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user, get_db
from app.models import AgentCustomPrompt, IntentRoute, User
from app.schemas import (
    AgentCustomPromptOut,
    AgentCustomPromptUpsert,
    IntentRouteCreate,
    IntentRouteOut,
    IntentRouteUpdate,
    MessageResponse,
)

router = APIRouter(prefix="/intent-routes", tags=["intent-routes"])


# ---------------------------------------------------------------------------
# Intent Routes
# ---------------------------------------------------------------------------

@router.post("", response_model=IntentRouteOut, status_code=201)
async def create_route(
    body: IntentRouteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    route = IntentRoute(user_id=current_user.id, **body.model_dump())
    db.add(route)
    await db.commit()
    await db.refresh(route)
    return route


@router.get("", response_model=List[IntentRouteOut])
async def list_routes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(IntentRoute)
        .where(IntentRoute.user_id == current_user.id)
        .order_by(IntentRoute.priority.desc(), IntentRoute.created_at)
    )
    return result.scalars().all()


@router.patch("/{route_id}", response_model=IntentRouteOut)
async def update_route(
    route_id: uuid.UUID,
    body: IntentRouteUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(IntentRoute).where(
            IntentRoute.id == route_id,
            IntentRoute.user_id == current_user.id,
        )
    )
    route = result.scalar_one_or_none()
    if not route:
        raise HTTPException(status_code=404, detail="Route introuvable")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(route, field, value)
    await db.commit()
    await db.refresh(route)
    return route


@router.delete("/{route_id}", response_model=MessageResponse)
async def delete_route(
    route_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(IntentRoute).where(
            IntentRoute.id == route_id,
            IntentRoute.user_id == current_user.id,
        )
    )
    route = result.scalar_one_or_none()
    if not route:
        raise HTTPException(status_code=404, detail="Route introuvable")
    await db.delete(route)
    await db.commit()
    return MessageResponse(message="Route supprimée")


# ---------------------------------------------------------------------------
# Custom Prompts
# ---------------------------------------------------------------------------

custom_router = APIRouter(prefix="/custom-prompts", tags=["custom-prompts"])


@custom_router.put("/{agent_slug}", response_model=AgentCustomPromptOut)
async def upsert_custom_prompt(
    agent_slug: str,
    body: AgentCustomPromptUpsert,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AgentCustomPrompt).where(
            AgentCustomPrompt.user_id == current_user.id,
            AgentCustomPrompt.agent_slug == agent_slug,
        )
    )
    prompt = result.scalar_one_or_none()
    if prompt:
        prompt.system_prompt = body.system_prompt
    else:
        prompt = AgentCustomPrompt(
            user_id=current_user.id,
            agent_slug=agent_slug,
            system_prompt=body.system_prompt,
        )
        db.add(prompt)
    await db.commit()
    await db.refresh(prompt)
    return prompt


@custom_router.get("", response_model=List[AgentCustomPromptOut])
async def list_custom_prompts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AgentCustomPrompt)
        .where(AgentCustomPrompt.user_id == current_user.id)
        .order_by(AgentCustomPrompt.agent_slug)
    )
    return result.scalars().all()


@custom_router.get("/{agent_slug}", response_model=AgentCustomPromptOut)
async def get_custom_prompt(
    agent_slug: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AgentCustomPrompt).where(
            AgentCustomPrompt.user_id == current_user.id,
            AgentCustomPrompt.agent_slug == agent_slug,
        )
    )
    prompt = result.scalar_one_or_none()
    if not prompt:
        raise HTTPException(status_code=404, detail="Aucun prompt personnalisé pour cet agent")
    return prompt


@custom_router.delete("/{agent_slug}", response_model=MessageResponse)
async def delete_custom_prompt(
    agent_slug: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AgentCustomPrompt).where(
            AgentCustomPrompt.user_id == current_user.id,
            AgentCustomPrompt.agent_slug == agent_slug,
        )
    )
    prompt = result.scalar_one_or_none()
    if not prompt:
        raise HTTPException(status_code=404, detail="Aucun prompt personnalisé pour cet agent")
    await db.delete(prompt)
    await db.commit()
    return MessageResponse(message="Prompt personnalisé supprimé")
