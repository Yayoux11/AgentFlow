import secrets
import urllib.parse
from datetime import timedelta

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.config import settings
from app.deps import get_current_user, get_db
from app.models import EmailIntegration, PasswordResetToken, Subscription, User
from app.models import utcnow
from app.schemas import (
    ForgotPasswordRequest, LoginRequest, MessageResponse, RefreshRequest,
    RegisterRequest, ResetPasswordRequest, TokenResponse, UserOut,
)
from app.services.crypto import encrypt_token
from app.services.email_service import send_reset_password_email, send_verification_email

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_SSO_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_SSO_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_SSO_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
GOOGLE_SSO_REDIRECT = f"{settings.BACKEND_URL}/auth/google/callback"
GOOGLE_SSO_SCOPES = "openid email profile https://www.googleapis.com/auth/gmail.modify"


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    verification_token = secrets.token_urlsafe(48)
    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name,
        email_verification_token=verification_token,
    )
    db.add(user)
    await db.flush()

    db.add(Subscription(user_id=user.id, plan="starter", status="active"))
    await db.commit()

    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
    background_tasks.add_task(send_verification_email, user.email, verify_url, user.full_name)

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    import uuid
    user_id = decode_token(body.refresh_token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


# ---------------------------------------------------------------------------
# Google SSO
# ---------------------------------------------------------------------------

@router.get("/google/auth-url")
async def google_sso_auth_url():
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(503, "Google SSO non configuré")
    state = secrets.token_urlsafe(16)
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_SSO_REDIRECT,
        "response_type": "code",
        "scope": GOOGLE_SSO_SCOPES,
        "access_type": "offline",
        "prompt": "select_account",
        "state": state,
    }
    return {"auth_url": f"{GOOGLE_SSO_AUTH_URL}?{urllib.parse.urlencode(params)}"}


@router.get("/google/callback")
async def google_sso_callback(
    code: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    # Exchange code for tokens
    try:
        async with httpx.AsyncClient() as client:
            token_resp = await client.post(GOOGLE_SSO_TOKEN_URL, data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_SSO_REDIRECT,
                "grant_type": "authorization_code",
            })
            token_resp.raise_for_status()
            tokens = token_resp.json()

            user_resp = await client.get(
                GOOGLE_SSO_USERINFO_URL,
                headers={"Authorization": f"Bearer {tokens['access_token']}"},
            )
            user_resp.raise_for_status()
            info = user_resp.json()
    except Exception as e:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=google_failed")

    email = info.get("email", "")
    full_name = info.get("name", "")

    if not email:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=no_email")

    # Find or create user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            email_verified=True,
        )
        db.add(user)
        await db.flush()
        db.add(Subscription(user_id=user.id, plan="starter", status="active"))
        await db.flush()
    elif not user.is_active:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=account_disabled")

    # Auto-link Gmail integration if refresh_token is present (first grant or scope upgrade)
    google_refresh_token = tokens.get("refresh_token")
    if google_refresh_token:
        from datetime import timedelta
        token_expiry = utcnow() + timedelta(seconds=tokens.get("expires_in", 3600))
        existing = await db.execute(
            select(EmailIntegration).where(
                EmailIntegration.user_id == user.id,
                EmailIntegration.provider == "gmail",
            )
        )
        integration = existing.scalar_one_or_none()
        if integration:
            integration.encrypted_access_token = encrypt_token(tokens["access_token"])
            integration.encrypted_refresh_token = encrypt_token(google_refresh_token)
            integration.token_expiry = token_expiry
            integration.is_active = True
        else:
            db.add(EmailIntegration(
                user_id=user.id,
                provider="gmail",
                email_address=email,
                encrypted_access_token=encrypt_token(tokens["access_token"]),
                encrypted_refresh_token=encrypt_token(google_refresh_token),
                token_expiry=token_expiry,
                is_active=True,
            ))

    await db.commit()

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    params = urllib.parse.urlencode({"access_token": access_token, "refresh_token": refresh_token})
    return RedirectResponse(f"{settings.FRONTEND_URL}/auth/callback?{params}")


# ---------------------------------------------------------------------------
# Email verification (B17)
# ---------------------------------------------------------------------------

@router.get("/verify-email", response_model=MessageResponse)
async def verify_email(token: str = Query(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email_verification_token == token))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="Lien de vérification invalide ou expiré.")
    if user.email_verified:
        return MessageResponse(message="Email déjà vérifié.")
    user.email_verified = True
    user.email_verification_token = None
    await db.commit()
    return MessageResponse(message="Email vérifié avec succès.")


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.email_verified:
        return MessageResponse(message="Email déjà vérifié.")
    token = secrets.token_urlsafe(48)
    current_user.email_verification_token = token
    await db.commit()
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    background_tasks.add_task(send_verification_email, current_user.email, verify_url, current_user.full_name)
    return MessageResponse(message="Email de vérification renvoyé.")


# ---------------------------------------------------------------------------
# Password reset (B7)
# ---------------------------------------------------------------------------

@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    body: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    # Always return 200 to avoid email enumeration
    if not user or not user.is_active:
        return MessageResponse(message="Si cet email est enregistré, un lien de réinitialisation a été envoyé.")

    token = secrets.token_urlsafe(48)
    expires = utcnow() + timedelta(hours=1)
    db.add(PasswordResetToken(user_id=user.id, token=token, expires_at=expires))
    await db.commit()

    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    background_tasks.add_task(send_reset_password_email, user.email, reset_url, user.full_name)
    return MessageResponse(message="Si cet email est enregistré, un lien de réinitialisation a été envoyé.")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PasswordResetToken).where(PasswordResetToken.token == body.token))
    prt = result.scalar_one_or_none()

    if not prt or prt.used or prt.expires_at < utcnow():
        raise HTTPException(status_code=400, detail="Lien expiré ou déjà utilisé.")

    user_result = await db.execute(select(User).where(User.id == prt.user_id))
    user = user_result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=400, detail="Compte introuvable.")

    user.hashed_password = hash_password(body.new_password)
    prt.used = True
    await db.commit()
    return MessageResponse(message="Mot de passe mis à jour avec succès.")
