"""Webhook triggers and scheduled runs (Phase 3)."""
import secrets
import uuid
from datetime import datetime, timezone
from typing import List

import anthropic
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.deps import get_current_user, get_db
from app.models import Agent, AgentRequest, ScheduledRun, User, WebhookTrigger
from app.schemas import (
    AgentRunResponse,
    MessageResponse,
    ScheduledRunCreate,
    ScheduledRunOut,
    ScheduledRunUpdate,
    WebhookTriggerCreate,
    WebhookTriggerOut,
)
from app.services.tools import (
    content_blocks_to_dicts,
    execute_tool,
    extract_text_from_blocks,
    get_tools_for_agent,
)

router = APIRouter(prefix="/triggers", tags=["triggers"])


# ---------------------------------------------------------------------------
# Webhook triggers — CRUD
# ---------------------------------------------------------------------------

@router.post("/webhooks", response_model=WebhookTriggerOut, status_code=201)
async def create_webhook_trigger(
    body: WebhookTriggerCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Agent).where(Agent.slug == body.agent_slug, Agent.is_active == True))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Agent not found")

    trigger = WebhookTrigger(
        user_id=current_user.id,
        agent_slug=body.agent_slug,
        name=body.name,
        secret_token=secrets.token_hex(32),
        created_at=datetime.now(timezone.utc),
    )
    db.add(trigger)
    await db.commit()
    await db.refresh(trigger)
    return trigger


@router.get("/webhooks", response_model=List[WebhookTriggerOut])
async def list_webhook_triggers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WebhookTrigger)
        .where(WebhookTrigger.user_id == current_user.id)
        .order_by(WebhookTrigger.created_at.desc())
    )
    return result.scalars().all()


@router.delete("/webhooks/{trigger_id}", response_model=MessageResponse)
async def delete_webhook_trigger(
    trigger_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WebhookTrigger).where(
            WebhookTrigger.id == trigger_id,
            WebhookTrigger.user_id == current_user.id,
        )
    )
    trigger = result.scalar_one_or_none()
    if not trigger:
        raise HTTPException(status_code=404, detail="Trigger not found")
    await db.delete(trigger)
    await db.commit()
    return MessageResponse(message="Webhook trigger deleted")


# ---------------------------------------------------------------------------
# Webhook trigger — fire endpoint (no auth, uses secret token)
# ---------------------------------------------------------------------------

@router.post("/fire/{token}", response_model=AgentRunResponse)
async def fire_webhook(token: str, request: Request, db: AsyncSession = Depends(get_db)):
    """External systems POST here with {prompt: '...'} to trigger an agent run."""
    trigger_result = await db.execute(
        select(WebhookTrigger).where(WebhookTrigger.secret_token == token, WebhookTrigger.is_active == True)
    )
    trigger = trigger_result.scalar_one_or_none()
    if not trigger:
        raise HTTPException(status_code=401, detail="Invalid or inactive webhook token")

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=422, detail="Request body must be valid JSON")

    prompt = payload.get("prompt", "")
    if not prompt:
        raise HTTPException(status_code=422, detail="Field 'prompt' is required")

    agent_result = await db.execute(select(Agent).where(Agent.slug == trigger.agent_slug, Agent.is_active == True))
    agent = agent_result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    user_result = await db.execute(select(User).where(User.id == trigger.user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Trigger owner not found")

    ai_response, in_tokens, out_tokens = await _run_agent_core(agent, prompt, user.id, db)

    log = AgentRequest(
        user_id=user.id,
        agent_id=agent.id,
        prompt=prompt,
        response=ai_response,
        input_tokens=in_tokens,
        output_tokens=out_tokens,
        conversation_id=uuid.uuid4(),
    )
    db.add(log)
    trigger.last_triggered_at = datetime.now(timezone.utc)
    await db.commit()

    return AgentRunResponse(
        response=ai_response,
        input_tokens=in_tokens,
        output_tokens=out_tokens,
        agent_name=agent.name,
        conversation_id=log.conversation_id,
    )


# ---------------------------------------------------------------------------
# Scheduled runs — CRUD
# ---------------------------------------------------------------------------

@router.post("/scheduled", response_model=ScheduledRunOut, status_code=201)
async def create_scheduled_run(
    body: ScheduledRunCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Agent).where(Agent.slug == body.agent_slug, Agent.is_active == True))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Agent not found")

    run = ScheduledRun(
        user_id=current_user.id,
        agent_slug=body.agent_slug,
        name=body.name,
        cron_expression=body.cron_expression,
        prompt_template=body.prompt_template,
        created_at=datetime.now(timezone.utc),
    )
    db.add(run)
    await db.commit()
    await db.refresh(run)
    return run


@router.get("/scheduled", response_model=List[ScheduledRunOut])
async def list_scheduled_runs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ScheduledRun)
        .where(ScheduledRun.user_id == current_user.id)
        .order_by(ScheduledRun.created_at.desc())
    )
    return result.scalars().all()


@router.patch("/scheduled/{run_id}", response_model=ScheduledRunOut)
async def update_scheduled_run(
    run_id: uuid.UUID,
    body: ScheduledRunUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ScheduledRun).where(ScheduledRun.id == run_id, ScheduledRun.user_id == current_user.id)
    )
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Scheduled run not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(run, field, value)
    await db.commit()
    await db.refresh(run)
    return run


@router.delete("/scheduled/{run_id}", response_model=MessageResponse)
async def delete_scheduled_run(
    run_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ScheduledRun).where(ScheduledRun.id == run_id, ScheduledRun.user_id == current_user.id)
    )
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Scheduled run not found")
    await db.delete(run)
    await db.commit()
    return MessageResponse(message="Scheduled run deleted")


# ---------------------------------------------------------------------------
# Internal helper
# ---------------------------------------------------------------------------

async def _run_agent_core(agent: Agent, prompt: str, user_id: uuid.UUID, db) -> tuple[str, int, int]:
    if not settings.ANTHROPIC_API_KEY:
        return f"[STUB] {agent.name} received: {prompt}", 0, 0

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    agent_tools = get_tools_for_agent(agent.tools or [])
    in_tokens = out_tokens = 0

    if agent_tools:
        loop_messages: list = [{"role": "user", "content": prompt}]
        ai_response = ""
        while True:
            resp = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=2048,
                system=agent.system_prompt,
                messages=loop_messages,
                tools=agent_tools,
            )
            in_tokens += resp.usage.input_tokens
            out_tokens += resp.usage.output_tokens
            if resp.stop_reason == "tool_use":
                loop_messages.append({"role": "assistant", "content": content_blocks_to_dicts(resp.content)})
                tool_results = []
                for block in resp.content:
                    if block.type == "tool_use":
                        result_str = await execute_tool(block.name, block.input, user_id, agent.slug, db)
                        tool_results.append({"type": "tool_result", "tool_use_id": block.id, "content": result_str})
                loop_messages.append({"role": "user", "content": tool_results})
            else:
                ai_response = extract_text_from_blocks(resp.content)
                break
    else:
        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=agent.system_prompt,
            messages=[{"role": "user", "content": prompt}],
        )
        ai_response = resp.content[0].text
        in_tokens = resp.usage.input_tokens
        out_tokens = resp.usage.output_tokens

    return ai_response, in_tokens, out_tokens
