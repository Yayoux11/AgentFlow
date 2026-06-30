"""Background email polling worker — runs every 5 minutes via APScheduler."""
import logging
from datetime import datetime, timezone, timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.models import AgentRule, EmailIntegration
from app.services.crypto import decrypt_token, encrypt_token
from app.services import gmail as gmail_svc
from app.services import outlook as outlook_svc
from app.services.email_processor import process_email_with_rule

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler(timezone="UTC")


async def _get_valid_access_token(integration: EmailIntegration, db: AsyncSession) -> str | None:
    """Return a valid access token, refreshing if expired."""
    access_token = decrypt_token(integration.encrypted_access_token)
    refresh_token = decrypt_token(integration.encrypted_refresh_token)

    needs_refresh = (
        integration.token_expiry is None
        or integration.token_expiry <= datetime.now(timezone.utc) + timedelta(minutes=5)
    )

    if needs_refresh:
        try:
            if integration.provider == "gmail":
                data = await gmail_svc.refresh_access_token(refresh_token)
            else:
                data = await outlook_svc.refresh_access_token(refresh_token)

            access_token = data["access_token"]
            integration.encrypted_access_token = encrypt_token(access_token)
            if "refresh_token" in data:
                integration.encrypted_refresh_token = encrypt_token(data["refresh_token"])
            if "expires_in" in data:
                integration.token_expiry = datetime.now(timezone.utc) + timedelta(seconds=data["expires_in"])
            await db.commit()
        except Exception as e:
            logger.error(f"Token refresh failed for integration {integration.id}: {e}")
            return None

    return access_token


async def poll_all_integrations() -> None:
    """Fetch unread emails for all active integrations and apply matching rules."""
    logger.info("Email worker: starting poll cycle")
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(EmailIntegration).where(EmailIntegration.is_active == True)
        )
        integrations = result.scalars().all()

        for integration in integrations:
            try:
                access_token = await _get_valid_access_token(integration, db)
                if not access_token:
                    continue

                # Fetch unread emails
                if integration.provider == "gmail":
                    emails = await gmail_svc.fetch_unread_emails(access_token, max_results=20)
                else:
                    emails = await outlook_svc.fetch_unread_emails(access_token, max_results=20)

                if not emails:
                    continue

                # Load active rules for this integration
                rules_result = await db.execute(
                    select(AgentRule).where(
                        AgentRule.integration_id == integration.id,
                        AgentRule.is_active == True,
                    )
                )
                rules = rules_result.scalars().all()

                if not rules:
                    continue

                for email in emails:
                    for rule in rules:
                        await process_email_with_rule(email, rule, integration, access_token, db)

                await db.commit()

            except Exception as e:
                logger.error(f"Worker error for integration {integration.id}: {e}")

    logger.info("Email worker: poll cycle complete")


def start_scheduler() -> None:
    if not scheduler.running:
        scheduler.add_job(
            poll_all_integrations,
            "interval",
            minutes=5,
            id="email_poller",
            replace_existing=True,
            next_run_time=None,  # don't run immediately on startup
        )
        scheduler.start()
        logger.info("Email worker scheduler started (interval: 5 min)")


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Email worker scheduler stopped")
