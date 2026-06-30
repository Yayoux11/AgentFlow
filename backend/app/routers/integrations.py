"""Email integrations router — OAuth flows, rules CRUD, job history."""
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import create_access_token, decode_token
from app.config import settings
from app.deps import get_current_user, get_db
from app.models import AgentRule, EmailIntegration, EmailJob, User
from app.schemas import (
    AgentRuleCreate, AgentRuleOut, AgentRuleUpdate,
    EmailIntegrationOut, EmailJobOut, MessageResponse,
)
from app.services.crypto import decrypt_token, encrypt_token
from app.services import gmail as gmail_svc
from app.services import outlook as outlook_svc

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/integrations", tags=["integrations"])

# We encode user_id in the OAuth state as a short-lived JWT
def _make_state(user_id: str, provider: str) -> str:
    return create_access_token(f"{provider}:{user_id}", expires_delta=timedelta(minutes=10))

def _parse_state(state: str) -> tuple[str, str]:
    """Returns (provider, user_id) or raises."""
    sub = decode_token(state)
    if not sub or ":" not in sub:
        raise HTTPException(400, "Invalid OAuth state")
    provider, user_id = sub.split(":", 1)
    return provider, user_id


# ---------------------------------------------------------------------------
# OAuth initiation
# ---------------------------------------------------------------------------

@router.get("/gmail/auth-url")
async def gmail_auth_url(current_user: User = Depends(get_current_user)):
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(503, "Gmail OAuth non configuré — ajoutez GOOGLE_CLIENT_ID dans .env")
    state = _make_state(str(current_user.id), "gmail")
    url = gmail_svc.get_gmail_auth_url(state)
    return {"auth_url": url}


@router.get("/outlook/auth-url")
async def outlook_auth_url(current_user: User = Depends(get_current_user)):
    if not settings.MICROSOFT_CLIENT_ID:
        raise HTTPException(503, "Outlook OAuth non configuré — ajoutez MICROSOFT_CLIENT_ID dans .env")
    state = _make_state(str(current_user.id), "outlook")
    url = outlook_svc.get_outlook_auth_url(state)
    return {"auth_url": url}


# ---------------------------------------------------------------------------
# OAuth callbacks
# ---------------------------------------------------------------------------

@router.get("/gmail/callback")
async def gmail_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    try:
        provider, user_id = _parse_state(state)
    except HTTPException:
        return RedirectResponse(f"{settings.FRONTEND_URL}/settings/integrations?error=invalid_state")

    try:
        tokens = await gmail_svc.exchange_code_for_tokens(code)
        access_token = tokens["access_token"]
        refresh_token = tokens.get("refresh_token", "")
        expires_in = tokens.get("expires_in", 3600)
        email_address = await gmail_svc.get_user_email(access_token)
    except Exception as e:
        logger.error(f"Gmail OAuth callback error: {e}")
        return RedirectResponse(f"{settings.FRONTEND_URL}/settings/integrations?error=oauth_failed")

    # Upsert integration
    result = await db.execute(
        select(EmailIntegration).where(
            EmailIntegration.user_id == uuid.UUID(user_id),
            EmailIntegration.provider == "gmail",
            EmailIntegration.email_address == email_address,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.encrypted_access_token = encrypt_token(access_token)
        if refresh_token:
            existing.encrypted_refresh_token = encrypt_token(refresh_token)
        existing.token_expiry = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
        existing.is_active = True
    else:
        db.add(EmailIntegration(
            user_id=uuid.UUID(user_id),
            provider="gmail",
            email_address=email_address,
            encrypted_access_token=encrypt_token(access_token),
            encrypted_refresh_token=encrypt_token(refresh_token) if refresh_token else encrypt_token(""),
            token_expiry=datetime.now(timezone.utc) + timedelta(seconds=expires_in),
        ))

    await db.commit()
    return RedirectResponse(f"{settings.FRONTEND_URL}/settings/integrations?connected=gmail")


@router.get("/outlook/callback")
async def outlook_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    try:
        provider, user_id = _parse_state(state)
    except HTTPException:
        return RedirectResponse(f"{settings.FRONTEND_URL}/settings/integrations?error=invalid_state")

    try:
        tokens = await outlook_svc.exchange_code_for_tokens(code)
        access_token = tokens["access_token"]
        refresh_token = tokens.get("refresh_token", "")
        expires_in = tokens.get("expires_in", 3600)
        email_address = await outlook_svc.get_user_email(access_token)
    except Exception as e:
        logger.error(f"Outlook OAuth callback error: {e}")
        return RedirectResponse(f"{settings.FRONTEND_URL}/settings/integrations?error=oauth_failed")

    result = await db.execute(
        select(EmailIntegration).where(
            EmailIntegration.user_id == uuid.UUID(user_id),
            EmailIntegration.provider == "outlook",
            EmailIntegration.email_address == email_address,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.encrypted_access_token = encrypt_token(access_token)
        if refresh_token:
            existing.encrypted_refresh_token = encrypt_token(refresh_token)
        existing.token_expiry = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
        existing.is_active = True
    else:
        db.add(EmailIntegration(
            user_id=uuid.UUID(user_id),
            provider="outlook",
            email_address=email_address,
            encrypted_access_token=encrypt_token(access_token),
            encrypted_refresh_token=encrypt_token(refresh_token) if refresh_token else encrypt_token(""),
            token_expiry=datetime.now(timezone.utc) + timedelta(seconds=expires_in),
        ))

    await db.commit()
    return RedirectResponse(f"{settings.FRONTEND_URL}/settings/integrations?connected=outlook")


# ---------------------------------------------------------------------------
# Integrations CRUD
# ---------------------------------------------------------------------------

@router.get("", response_model=List[EmailIntegrationOut])
async def list_integrations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(EmailIntegration).where(EmailIntegration.user_id == current_user.id)
    )
    return result.scalars().all()


@router.delete("/{integration_id}", response_model=MessageResponse)
async def delete_integration(
    integration_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(EmailIntegration).where(
            EmailIntegration.id == integration_id,
            EmailIntegration.user_id == current_user.id,
        )
    )
    integration = result.scalar_one_or_none()
    if not integration:
        raise HTTPException(404, "Integration not found")
    await db.delete(integration)
    await db.commit()
    return MessageResponse(message="Integration supprimée")


# ---------------------------------------------------------------------------
# Rules CRUD
# ---------------------------------------------------------------------------

@router.get("/{integration_id}/rules", response_model=List[AgentRuleOut])
async def list_rules(
    integration_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AgentRule).where(
            AgentRule.integration_id == integration_id,
            AgentRule.user_id == current_user.id,
        )
    )
    return result.scalars().all()


@router.post("/{integration_id}/rules", response_model=AgentRuleOut, status_code=201)
async def create_rule(
    integration_id: uuid.UUID,
    body: AgentRuleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify integration belongs to user
    result = await db.execute(
        select(EmailIntegration).where(
            EmailIntegration.id == integration_id,
            EmailIntegration.user_id == current_user.id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(404, "Integration not found")

    rule = AgentRule(
        user_id=current_user.id,
        integration_id=integration_id,
        **body.model_dump(),
    )
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return rule


@router.patch("/{integration_id}/rules/{rule_id}", response_model=AgentRuleOut)
async def update_rule(
    integration_id: uuid.UUID,
    rule_id: uuid.UUID,
    body: AgentRuleUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AgentRule).where(
            AgentRule.id == rule_id,
            AgentRule.integration_id == integration_id,
            AgentRule.user_id == current_user.id,
        )
    )
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(404, "Rule not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(rule, field, value)
    await db.commit()
    await db.refresh(rule)
    return rule


@router.delete("/{integration_id}/rules/{rule_id}", response_model=MessageResponse)
async def delete_rule(
    integration_id: uuid.UUID,
    rule_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AgentRule).where(
            AgentRule.id == rule_id,
            AgentRule.integration_id == integration_id,
            AgentRule.user_id == current_user.id,
        )
    )
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(404, "Rule not found")
    await db.delete(rule)
    await db.commit()
    return MessageResponse(message="Règle supprimée")


# ---------------------------------------------------------------------------
# Job history
# ---------------------------------------------------------------------------

@router.get("/{integration_id}/jobs", response_model=List[EmailJobOut])
async def list_jobs(
    integration_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(EmailJob)
        .where(
            EmailJob.integration_id == integration_id,
            EmailJob.user_id == current_user.id,
        )
        .order_by(EmailJob.processed_at.desc())
        .limit(50)
    )
    return result.scalars().all()


# ---------------------------------------------------------------------------
# Dry-run test
# ---------------------------------------------------------------------------

@router.post("/{integration_id}/test", response_model=dict)
async def test_integration(
    integration_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch the latest unread email and show what the agent would do (no action taken)."""
    result = await db.execute(
        select(EmailIntegration).where(
            EmailIntegration.id == integration_id,
            EmailIntegration.user_id == current_user.id,
        )
    )
    integration = result.scalar_one_or_none()
    if not integration:
        raise HTTPException(404, "Integration not found")

    access_token = decrypt_token(integration.encrypted_access_token)
    try:
        if integration.provider == "gmail":
            emails = await gmail_svc.fetch_unread_emails(access_token, max_results=1)
        else:
            emails = await outlook_svc.fetch_unread_emails(access_token, max_results=1)
    except Exception as e:
        raise HTTPException(502, f"Impossible de lire la boîte mail : {e}")

    if not emails:
        return {"message": "Aucun email non lu trouvé", "email": None}

    email = emails[0]
    return {
        "message": "Email trouvé — simulation (aucune action réelle prise)",
        "email": {
            "from": email["from"],
            "subject": email["subject"],
            "snippet": email["snippet"],
        },
    }
