import logging
import uuid
from typing import Any

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User

logger = logging.getLogger(__name__)

TIMEOUT = 10.0


async def send_webhook(user_id: uuid.UUID, event: str, payload: dict[str, Any], db: AsyncSession) -> None:
    result = await db.execute(select(User.webhook_url).where(User.id == user_id))
    webhook_url = result.scalar_one_or_none()
    if not webhook_url:
        return

    body = {"event": event, **payload}
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(webhook_url, json=body, headers={"User-Agent": "AgentFlow-Webhook/1.0"})
            resp.raise_for_status()
    except Exception as e:
        logger.warning(f"Webhook delivery failed for user {user_id} → {webhook_url}: {e}")
