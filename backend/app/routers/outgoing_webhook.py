from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, HttpUrl
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user, get_db
from app.models import User
from app.schemas import MessageResponse

router = APIRouter(prefix="/settings/webhook", tags=["webhook"])


class WebhookConfig(BaseModel):
    webhook_url: Optional[str] = None


class WebhookOut(BaseModel):
    webhook_url: Optional[str]


@router.get("", response_model=WebhookOut)
async def get_webhook(current_user: User = Depends(get_current_user)):
    return WebhookOut(webhook_url=current_user.webhook_url)


@router.put("", response_model=WebhookOut)
async def update_webhook(
    body: WebhookConfig,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    url = body.webhook_url
    if url is not None and url.strip() == "":
        url = None
    if url and not (url.startswith("http://") or url.startswith("https://")):
        raise HTTPException(status_code=422, detail="L'URL doit commencer par http:// ou https://")
    current_user.webhook_url = url
    await db.commit()
    await db.refresh(current_user)
    return WebhookOut(webhook_url=current_user.webhook_url)


@router.post("/test", response_model=MessageResponse)
async def test_webhook(current_user: User = Depends(get_current_user)):
    if not current_user.webhook_url:
        raise HTTPException(status_code=400, detail="Aucun webhook configuré")
    payload = {
        "event": "test",
        "message": "Ceci est un test de webhook AgentFlow.",
        "user_email": current_user.email,
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                current_user.webhook_url,
                json=payload,
                headers={"User-Agent": "AgentFlow-Webhook/1.0"},
            )
            resp.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Échec de la livraison : {e}")
    return MessageResponse(message="Webhook test envoyé avec succès !")
