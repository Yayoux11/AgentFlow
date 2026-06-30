"""Outlook integration via Microsoft OAuth2 + Microsoft Graph API (fully async with httpx)."""
import logging
from typing import Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

GRAPH_API = "https://graph.microsoft.com/v1.0/me"


def _token_url() -> str:
    return f"https://login.microsoftonline.com/{settings.MICROSOFT_TENANT_ID}/oauth2/v2.0/token"


def _auth_url_base() -> str:
    return f"https://login.microsoftonline.com/{settings.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize"


OUTLOOK_SCOPES = "openid email offline_access Mail.ReadWrite Mail.Send"


def get_outlook_auth_url(state: str) -> str:
    import urllib.parse
    params = {
        "client_id": settings.MICROSOFT_CLIENT_ID,
        "redirect_uri": settings.MICROSOFT_REDIRECT_URI,
        "response_type": "code",
        "scope": OUTLOOK_SCOPES,
        "state": state,
        "response_mode": "query",
    }
    return f"{_auth_url_base()}?{urllib.parse.urlencode(params)}"


async def exchange_code_for_tokens(code: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(_token_url(), data={
            "code": code,
            "client_id": settings.MICROSOFT_CLIENT_ID,
            "client_secret": settings.MICROSOFT_CLIENT_SECRET,
            "redirect_uri": settings.MICROSOFT_REDIRECT_URI,
            "grant_type": "authorization_code",
            "scope": OUTLOOK_SCOPES,
        })
        resp.raise_for_status()
        return resp.json()


async def refresh_access_token(refresh_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(_token_url(), data={
            "refresh_token": refresh_token,
            "client_id": settings.MICROSOFT_CLIENT_ID,
            "client_secret": settings.MICROSOFT_CLIENT_SECRET,
            "grant_type": "refresh_token",
            "scope": OUTLOOK_SCOPES,
        })
        resp.raise_for_status()
        return resp.json()


async def get_user_email(access_token: str) -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GRAPH_API}",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"$select": "mail,userPrincipalName"},
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("mail") or data.get("userPrincipalName", "")


async def fetch_unread_emails(access_token: str, max_results: int = 10) -> list[dict]:
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GRAPH_API}/mailFolders/inbox/messages",
            headers=headers,
            params={
                "$filter": "isRead eq false",
                "$top": max_results,
                "$select": "id,conversationId,subject,from,receivedDateTime,bodyPreview",
                "$orderby": "receivedDateTime desc",
            },
        )
        resp.raise_for_status()
        items = resp.json().get("value", [])
        return [
            {
                "id": m["id"],
                "thread_id": m.get("conversationId"),
                "subject": m.get("subject", "(sans objet)"),
                "from": m.get("from", {}).get("emailAddress", {}).get("address", ""),
                "date": m.get("receivedDateTime", ""),
                "snippet": m.get("bodyPreview", ""),
            }
            for m in items
        ]


async def get_email_body(access_token: str, message_id: str) -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GRAPH_API}/messages/{message_id}",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Prefer": 'outlook.body-content-type="text"',
            },
            params={"$select": "body"},
        )
        resp.raise_for_status()
        return resp.json().get("body", {}).get("content", "")


async def create_draft(
    access_token: str, to: str, subject: str, body: str, thread_id: Optional[str] = None
) -> str:
    payload = {
        "subject": subject,
        "body": {"contentType": "Text", "content": body},
        "toRecipients": [{"emailAddress": {"address": to}}],
    }
    if thread_id:
        payload["conversationId"] = thread_id

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{GRAPH_API}/messages",
            headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
            json=payload,
        )
        resp.raise_for_status()
        return resp.json()["id"]


async def send_email(
    access_token: str, to: str, subject: str, body: str, thread_id: Optional[str] = None
) -> str:
    payload = {
        "message": {
            "subject": subject,
            "body": {"contentType": "Text", "content": body},
            "toRecipients": [{"emailAddress": {"address": to}}],
        },
        "saveToSentItems": True,
    }
    if thread_id:
        payload["message"]["conversationId"] = thread_id

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{GRAPH_API}/sendMail",
            headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
            json=payload,
        )
        resp.raise_for_status()
        return "sent"


async def mark_as_read(access_token: str, message_id: str) -> None:
    async with httpx.AsyncClient() as client:
        await client.patch(
            f"{GRAPH_API}/messages/{message_id}",
            headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
            json={"isRead": True},
        )
