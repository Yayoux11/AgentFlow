"""Gmail integration via Google OAuth2 + Gmail REST API (fully async with httpx)."""
import base64
import email as email_lib
import logging
from typing import Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/userinfo.email",
    "openid",
]
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me"


def get_gmail_auth_url(state: str) -> str:
    import urllib.parse
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(GMAIL_SCOPES),
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    }
    return f"{GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}"


async def exchange_code_for_tokens(code: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        resp.raise_for_status()
        return resp.json()


async def refresh_access_token(refresh_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(GOOGLE_TOKEN_URL, data={
            "refresh_token": refresh_token,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "grant_type": "refresh_token",
        })
        resp.raise_for_status()
        return resp.json()


async def get_user_email(access_token: str) -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.get(GOOGLE_USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"})
        resp.raise_for_status()
        return resp.json()["email"]


async def fetch_unread_emails(access_token: str, max_results: int = 10) -> list[dict]:
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        # List unread message IDs
        resp = await client.get(
            f"{GMAIL_API}/messages",
            headers=headers,
            params={"q": "is:unread", "maxResults": max_results},
        )
        resp.raise_for_status()
        data = resp.json()
        messages = data.get("messages", [])

        results = []
        for msg in messages:
            try:
                detail = await client.get(
                    f"{GMAIL_API}/messages/{msg['id']}",
                    headers=headers,
                    params={"format": "metadata", "metadataHeaders": ["Subject", "From", "Date"]},
                )
                detail.raise_for_status()
                d = detail.json()
                headers_list = d.get("payload", {}).get("headers", [])
                h = {h["name"]: h["value"] for h in headers_list}
                results.append({
                    "id": msg["id"],
                    "thread_id": d.get("threadId"),
                    "subject": h.get("Subject", "(sans objet)"),
                    "from": h.get("From", ""),
                    "date": h.get("Date", ""),
                    "snippet": d.get("snippet", ""),
                })
            except Exception as e:
                logger.warning(f"Failed to fetch Gmail message {msg['id']}: {e}")
        return results


async def get_email_body(access_token: str, message_id: str) -> str:
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GMAIL_API}/messages/{message_id}",
            headers=headers,
            params={"format": "full"},
        )
        resp.raise_for_status()
        payload = resp.json().get("payload", {})
        return _extract_body(payload)


def _extract_body(payload: dict) -> str:
    """Recursively extract plain text body from Gmail payload."""
    mime = payload.get("mimeType", "")
    if mime == "text/plain":
        data = payload.get("body", {}).get("data", "")
        return base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="replace")
    for part in payload.get("parts", []):
        result = _extract_body(part)
        if result:
            return result
    return payload.get("snippet", "")


async def create_draft(
    access_token: str, to: str, subject: str, body: str, thread_id: Optional[str] = None
) -> str:
    raw = _build_raw_email(to, subject, body)
    msg: dict = {"message": {"raw": raw}}
    if thread_id:
        msg["message"]["threadId"] = thread_id

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{GMAIL_API}/drafts",
            headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
            json=msg,
        )
        resp.raise_for_status()
        return resp.json()["id"]


async def send_email(
    access_token: str, to: str, subject: str, body: str, thread_id: Optional[str] = None
) -> str:
    raw = _build_raw_email(to, subject, body)
    payload: dict = {"raw": raw}
    if thread_id:
        payload["threadId"] = thread_id

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{GMAIL_API}/messages/send",
            headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
            json=payload,
        )
        resp.raise_for_status()
        return resp.json()["id"]


async def mark_as_read(access_token: str, message_id: str) -> None:
    async with httpx.AsyncClient() as client:
        await client.post(
            f"{GMAIL_API}/messages/{message_id}/modify",
            headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
            json={"removeLabelIds": ["UNREAD"]},
        )


def _build_raw_email(to: str, subject: str, body: str) -> str:
    msg = email_lib.message.EmailMessage()
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    return raw
