import uuid
from datetime import datetime, timezone

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.deps import get_db
from app.models import Subscription, User

stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/stripe")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Stripe webhook not configured")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        await _handle_checkout_completed(data, db)

    elif event_type in ("customer.subscription.updated", "customer.subscription.created"):
        await _handle_subscription_updated(data, db)

    elif event_type == "customer.subscription.deleted":
        await _handle_subscription_deleted(data, db)

    elif event_type == "invoice.payment_failed":
        await _handle_payment_failed(data, db)

    return {"status": "ok"}


async def _handle_checkout_completed(session: dict, db: AsyncSession) -> None:
    meta = session.get("metadata", {})
    user_id_str = meta.get("user_id")
    plan = meta.get("plan", "pro")
    stripe_sub_id = session.get("subscription")
    stripe_customer_id = session.get("customer")

    if not user_id_str:
        return

    user_result = await db.execute(select(User).where(User.id == uuid.UUID(user_id_str)))
    user = user_result.scalar_one_or_none()
    if not user:
        return

    # Fetch subscription period from Stripe
    period_end = None
    period_start = None
    if stripe_sub_id:
        stripe_sub = stripe.Subscription.retrieve(stripe_sub_id)
        period_end = datetime.fromtimestamp(stripe_sub["current_period_end"], tz=timezone.utc)
        period_start = datetime.fromtimestamp(stripe_sub["current_period_start"], tz=timezone.utc)

    sub_result = await db.execute(select(Subscription).where(Subscription.user_id == user.id))
    sub = sub_result.scalar_one_or_none()

    if sub:
        sub.plan = plan
        sub.stripe_subscription_id = stripe_sub_id
        sub.stripe_customer_id = stripe_customer_id
        sub.status = "active"
        sub.current_period_start = period_start
        sub.current_period_end = period_end
        sub.cancel_at_period_end = False
    else:
        sub = Subscription(
            user_id=user.id,
            plan=plan,
            stripe_subscription_id=stripe_sub_id,
            stripe_customer_id=stripe_customer_id,
            status="active",
            current_period_start=period_start,
            current_period_end=period_end,
        )
        db.add(sub)

    if not user.stripe_customer_id:
        user.stripe_customer_id = stripe_customer_id

    await db.commit()


async def _handle_subscription_updated(stripe_sub: dict, db: AsyncSession) -> None:
    sub_id = stripe_sub["id"]
    result = await db.execute(select(Subscription).where(Subscription.stripe_subscription_id == sub_id))
    sub = result.scalar_one_or_none()
    if not sub:
        return

    sub.status = stripe_sub["status"]
    sub.cancel_at_period_end = stripe_sub.get("cancel_at_period_end", False)
    sub.current_period_end = datetime.fromtimestamp(stripe_sub["current_period_end"], tz=timezone.utc)
    sub.current_period_start = datetime.fromtimestamp(stripe_sub["current_period_start"], tz=timezone.utc)
    await db.commit()


async def _handle_subscription_deleted(stripe_sub: dict, db: AsyncSession) -> None:
    sub_id = stripe_sub["id"]
    result = await db.execute(select(Subscription).where(Subscription.stripe_subscription_id == sub_id))
    sub = result.scalar_one_or_none()
    if not sub:
        return

    sub.status = "canceled"
    sub.plan = "starter"
    sub.stripe_subscription_id = None
    await db.commit()


async def _handle_payment_failed(invoice: dict, db: AsyncSession) -> None:
    stripe_sub_id = invoice.get("subscription")
    if not stripe_sub_id:
        return
    result = await db.execute(select(Subscription).where(Subscription.stripe_subscription_id == stripe_sub_id))
    sub = result.scalar_one_or_none()
    if sub:
        sub.status = "past_due"
        await db.commit()
