"""Intent router — uses Claude Haiku to classify user intent and select agent."""
import json
import logging
import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import IntentRoute

logger = logging.getLogger(__name__)


async def route_intent(
    db: AsyncSession,
    user_id: uuid.UUID,
    prompt: str,
    current_slug: str,
) -> str:
    """Return the agent slug to use. Falls back to current_slug if routing fails."""
    if not settings.ANTHROPIC_API_KEY:
        return current_slug

    result = await db.execute(
        select(IntentRoute)
        .where(IntentRoute.user_id == user_id, IntentRoute.is_active == True)
        .order_by(IntentRoute.priority.desc())
    )
    routes = result.scalars().all()
    if not routes:
        return current_slug

    routes_desc = "\n".join(
        f"- slug={r.agent_slug}, name={r.name}: {r.description}"
        for r in routes
    )

    classification_prompt = f"""You are an intent router for an AI agent platform.
Given a user message, select the most appropriate agent from the list.
Respond with ONLY a JSON object: {{"agent_slug": "<slug>", "confidence": <0-1>}}

Available agents:
{routes_desc}

User message: {prompt[:1000]}"""

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=100,
            messages=[{"role": "user", "content": classification_prompt}],
        )
        text = message.content[0].text.strip()
        data = json.loads(text)
        slug = data.get("agent_slug", "")
        confidence = float(data.get("confidence", 0))

        valid_slugs = {r.agent_slug for r in routes}
        if slug in valid_slugs and confidence >= 0.6:
            return slug
    except Exception as e:
        logger.warning(f"Intent routing failed: {e}")

    return current_slug
