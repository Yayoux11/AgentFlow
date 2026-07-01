"""Process an incoming email through an AgentRule using Claude, then take action."""
import logging
from datetime import datetime, timezone

import anthropic
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import Agent, AgentRule, EmailIntegration, EmailJob
from app.services.notifications import create_notification
from app.services.crypto import decrypt_token
from app.services import gmail as gmail_svc
from app.services import outlook as outlook_svc

logger = logging.getLogger(__name__)


def _email_matches_rule(email: dict, rule: AgentRule) -> bool:
    """Return True if the email satisfies the rule's trigger conditions."""
    if rule.trigger == "new_email":
        return True

    if rule.trigger == "keyword":
        keywords = [k.lower() for k in rule.trigger_config.get("keywords", [])]
        text = (email.get("subject", "") + " " + email.get("snippet", "")).lower()
        return any(kw in text for kw in keywords)

    if rule.trigger == "sender":
        senders = [s.lower() for s in rule.trigger_config.get("senders", [])]
        from_addr = email.get("from", "").lower()
        return any(s in from_addr for s in senders)

    return False


async def _get_email_body(integration: EmailIntegration, access_token: str, email_id: str) -> str:
    try:
        if integration.provider == "gmail":
            return await gmail_svc.get_email_body(access_token, email_id)
        return await outlook_svc.get_email_body(access_token, email_id)
    except Exception as e:
        logger.warning(f"Could not fetch email body for {email_id}: {e}")
        return ""


async def process_email_with_rule(
    email: dict,
    rule: AgentRule,
    integration: EmailIntegration,
    access_token: str,
    db: AsyncSession,
) -> None:
    """Process one email against one rule. Logs result in EmailJob."""
    if not _email_matches_rule(email, rule):
        return

    # Fetch agent system prompt
    agent_result = await db.execute(select(Agent).where(Agent.slug == rule.agent_slug))
    agent = agent_result.scalar_one_or_none()
    system_prompt = agent.system_prompt if agent else "You are a professional email assistant."

    # Build prompt
    body = await _get_email_body(integration, access_token, email["id"])
    prompt_template = rule.action_config.get(
        "prompt_template",
        "Rédige une réponse professionnelle et concise à cet email."
    )
    full_prompt = (
        f"Email reçu :\nDe : {email['from']}\nObjet : {email['subject']}\n\n{body or email.get('snippet', '')}\n\n"
        f"Instruction : {prompt_template}"
    )

    # Call Claude
    ai_response = ""
    try:
        if settings.ANTHROPIC_API_KEY:
            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            message = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1024,
                system=system_prompt,
                messages=[{"role": "user", "content": full_prompt}],
            )
            ai_response = message.content[0].text
        else:
            ai_response = f"[STUB] Réponse automatique à : {email['subject']}"
    except Exception as e:
        logger.error(f"Claude error processing email {email['id']}: {e}")
        db.add(EmailJob(
            user_id=rule.user_id, integration_id=integration.id, rule_id=rule.id,
            email_id=email["id"], subject=email["subject"], from_address=email["from"],
            action_taken="error", error_message=str(e),
        ))
        return

    # Take action
    action_taken = "skipped"
    try:
        sender_address = email["from"].split("<")[-1].rstrip(">").strip() if "<" in email["from"] else email["from"]
        reply_subject = email["subject"] if email["subject"].lower().startswith("re:") else f"Re: {email['subject']}"

        if rule.action == "draft":
            if integration.provider == "gmail":
                await gmail_svc.create_draft(access_token, sender_address, reply_subject, ai_response, email.get("thread_id"))
            else:
                await outlook_svc.create_draft(access_token, sender_address, reply_subject, ai_response, email.get("thread_id"))
            action_taken = "drafted"

        elif rule.action == "send":
            if integration.provider == "gmail":
                await gmail_svc.send_email(access_token, sender_address, reply_subject, ai_response, email.get("thread_id"))
            else:
                await outlook_svc.send_email(access_token, sender_address, reply_subject, ai_response)
            action_taken = "sent"

        # Mark as read so we don't reprocess
        if integration.provider == "gmail":
            await gmail_svc.mark_as_read(access_token, email["id"])
        else:
            await outlook_svc.mark_as_read(access_token, email["id"])

    except Exception as e:
        logger.error(f"Action error for email {email['id']}: {e}")
        action_taken = "error"
        db.add(EmailJob(
            user_id=rule.user_id, integration_id=integration.id, rule_id=rule.id,
            email_id=email["id"], subject=email["subject"], from_address=email["from"],
            action_taken="error", ai_response=ai_response, error_message=str(e),
        ))
        return

    db.add(EmailJob(
        user_id=rule.user_id, integration_id=integration.id, rule_id=rule.id,
        email_id=email["id"], subject=email["subject"], from_address=email["from"],
        action_taken=action_taken, ai_response=ai_response,
    ))

    action_label = "réponse rédigée" if action_taken == "drafted" else "email envoyé"
    subject_preview = email["subject"][:60] + ("…" if len(email["subject"]) > 60 else "")
    await create_notification(
        user_id=rule.user_id,
        type="email_rule",
        title=f"Règle « {rule.name} » — {action_label}",
        body=f"Email de {email['from'].split('<')[0].strip()} : {subject_preview}",
        db=db,
    )
    logger.info(f"Email {email['id']} processed → {action_taken}")
