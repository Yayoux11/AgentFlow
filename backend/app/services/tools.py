"""Agent tools — definitions and executor for Claude function calling."""
import base64
import uuid
from datetime import datetime, timezone, timedelta
from email.mime.text import MIMEText
from typing import Any

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import EmailIntegration

TOOL_DEFINITIONS: dict[str, dict] = {
    "call_agent": {
        "name": "call_agent",
        "description": (
            "Call another specialized agent to delegate a sub-task and get expert output. "
            "Use this when you need expertise outside your own domain. "
            "Available agent slugs: apartment-finder, job-finder, car-finder, fullstack-dev, "
            "security-auditor, lead-dev, project-manager, product-owner, scrum-master, "
            "cover-letter, profile-finder, email-writer, data-analyst, social-manager, "
            "support-bot, hr-recruiter, finance-tracker, code-reviewer, seo-optimizer."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "agent_slug": {
                    "type": "string",
                    "description": "The slug of the agent to call",
                },
                "prompt": {
                    "type": "string",
                    "description": "The task or question to send to the other agent",
                },
            },
            "required": ["agent_slug", "prompt"],
        },
    },
    "get_current_datetime": {
        "name": "get_current_datetime",
        "description": "Get the current date and time in UTC.",
        "input_schema": {"type": "object", "properties": {}, "required": []},
    },
    "send_email": {
        "name": "send_email",
        "description": "Send an email via the user's connected Gmail account.",
        "input_schema": {
            "type": "object",
            "properties": {
                "to": {"type": "string", "description": "Recipient email address"},
                "subject": {"type": "string", "description": "Email subject line"},
                "body": {"type": "string", "description": "Email body in plain text"},
            },
            "required": ["to", "subject", "body"],
        },
    },
    "read_recent_emails": {
        "name": "read_recent_emails",
        "description": "Read recent emails from the user's connected Gmail account.",
        "input_schema": {
            "type": "object",
            "properties": {
                "max_results": {
                    "type": "integer",
                    "description": "Number of emails to fetch (1–10)",
                    "default": 5,
                },
                "query": {
                    "type": "string",
                    "description": "Gmail search query, e.g. 'from:boss@company.com is:unread'",
                },
            },
            "required": [],
        },
    },
    "search_knowledge_base": {
        "name": "search_knowledge_base",
        "description": "Search the user's uploaded knowledge base for relevant information.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"},
            },
            "required": ["query"],
        },
    },
}


def get_tools_for_agent(agent_tools: list) -> list:
    """Return Claude-compatible tool definitions for the given tool name list."""
    return [TOOL_DEFINITIONS[name] for name in (agent_tools or []) if name in TOOL_DEFINITIONS]


def content_blocks_to_dicts(blocks: list) -> list:
    """Convert Anthropic SDK content blocks to plain dicts (for messages array)."""
    result = []
    for b in blocks:
        if b.type == "text":
            result.append({"type": "text", "text": b.text})
        elif b.type == "tool_use":
            result.append({"type": "tool_use", "id": b.id, "name": b.name, "input": b.input})
    return result


def extract_text_from_blocks(blocks: list) -> str:
    """Concatenate all text blocks into a single string."""
    return "".join(b.text for b in blocks if b.type == "text")


async def _get_valid_gmail_token(user_id: uuid.UUID, db: AsyncSession) -> str | None:
    from app.services.crypto import decrypt, encrypt

    result = await db.execute(
        select(EmailIntegration).where(
            EmailIntegration.user_id == user_id,
            EmailIntegration.provider == "gmail",
            EmailIntegration.is_active == True,
        )
    )
    integration = result.scalar_one_or_none()
    if not integration:
        return None

    now = datetime.now(timezone.utc)
    if not integration.token_expiry or integration.token_expiry <= now:
        from app.services.gmail import refresh_access_token
        refresh_token = decrypt(integration.encrypted_refresh_token)
        tokens = await refresh_access_token(refresh_token)
        access_token = tokens["access_token"]
        integration.encrypted_access_token = encrypt(access_token)
        integration.token_expiry = now + timedelta(seconds=tokens.get("expires_in", 3600))
        await db.commit()
    else:
        access_token = decrypt(integration.encrypted_access_token)

    return access_token


async def execute_tool(
    name: str,
    input_data: dict,
    user_id: uuid.UUID,
    agent_slug: str,
    db: AsyncSession,
    call_depth: int = 0,
) -> str:
    """Execute a tool call and return the result as a string."""

    if name == "call_agent":
        if call_depth >= 2:
            return "Error: Maximum agent nesting depth reached (2 levels)."

        target_slug = input_data.get("agent_slug", "").strip()
        sub_prompt = input_data.get("prompt", "").strip()
        if not target_slug or not sub_prompt:
            return "Error: agent_slug and prompt are required."
        if target_slug == agent_slug:
            return "Error: An agent cannot call itself."

        from sqlalchemy import select
        from app.models import Agent
        from app.config import settings
        import anthropic

        agent_result = await db.execute(
            select(Agent).where(Agent.slug == target_slug, Agent.is_active == True)
        )
        target_agent = agent_result.scalar_one_or_none()
        if not target_agent:
            return f"Error: Agent '{target_slug}' not found or inactive."

        if not settings.ANTHROPIC_API_KEY:
            return f"[STUB] {target_agent.name} would respond to: {sub_prompt}"

        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        sub_tools = get_tools_for_agent(target_agent.tools or [])
        loop_messages: list = [{"role": "user", "content": sub_prompt}]

        while True:
            resp = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1024,
                system=target_agent.system_prompt,
                messages=loop_messages,
                **({"tools": sub_tools} if sub_tools else {}),
            )
            if resp.stop_reason == "tool_use":
                loop_messages.append({"role": "assistant", "content": content_blocks_to_dicts(resp.content)})
                sub_results = []
                for block in resp.content:
                    if block.type == "tool_use":
                        r = await execute_tool(block.name, block.input, user_id, target_slug, db, call_depth + 1)
                        sub_results.append({"type": "tool_result", "tool_use_id": block.id, "content": r})
                loop_messages.append({"role": "user", "content": sub_results})
            else:
                result_text = extract_text_from_blocks(resp.content) or (resp.content[0].text if resp.content else "")
                break

        return f"[{target_agent.name}]:\n{result_text}"

    if name == "get_current_datetime":
        return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    elif name == "send_email":
        access_token = await _get_valid_gmail_token(user_id, db)
        if not access_token:
            return "Error: No Gmail account connected. The user must connect Gmail in Settings > Integrations."
        try:
            msg = MIMEText(input_data["body"])
            msg["to"] = input_data["to"]
            msg["subject"] = input_data["subject"]
            raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
                    headers={"Authorization": f"Bearer {access_token}"},
                    json={"raw": raw},
                )
                resp.raise_for_status()
            return f"Email sent to {input_data['to']} — subject: '{input_data['subject']}'."
        except Exception as e:
            return f"Error sending email: {e}"

    elif name == "read_recent_emails":
        access_token = await _get_valid_gmail_token(user_id, db)
        if not access_token:
            return "Error: No Gmail account connected."
        try:
            from app.services.gmail import fetch_unread_emails
            max_results = min(int(input_data.get("max_results", 5)), 10)
            emails = await fetch_unread_emails(access_token, max_results=max_results)
            if not emails:
                return "No recent emails found."
            parts = []
            for e in emails:
                parts.append(
                    f"From: {e.get('from', '?')}\n"
                    f"Subject: {e.get('subject', '(no subject)')}\n"
                    f"Date: {e.get('date', '?')}\n"
                    f"Preview: {str(e.get('body', ''))[:400]}"
                )
            return "\n\n---\n\n".join(parts)
        except Exception as e:
            return f"Error reading emails: {e}"

    elif name == "search_knowledge_base":
        try:
            from app.services.rag import retrieve_context
            context = await retrieve_context(db, user_id, input_data["query"], agent_slug=agent_slug)
            return context or "No relevant content found in your knowledge base."
        except Exception as e:
            return f"Error searching knowledge base: {e}"

    return f"Unknown tool: {name}"
