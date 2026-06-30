from datetime import datetime, timezone

import stripe
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.deps import get_current_user, get_db
from app.models import Subscription, User, UsageStat
from app.schemas import (
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    MessageResponse,
    SubscriptionOut,
    UsageOut,
)

stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

PLAN_PRICE_IDS = {
    "pro": settings.STRIPE_PRICE_PRO,
    "enterprise": settings.STRIPE_PRICE_ENTERPRISE,
}


@router.post("/create-checkout", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    body: CheckoutSessionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Stripe not configured")

    price_id = PLAN_PRICE_IDS.get(body.plan)
    if not price_id:
        raise HTTPException(status_code=400, detail="Invalid plan")

    # Create or reuse Stripe customer
    if not current_user.stripe_customer_id:
        customer = stripe.Customer.create(email=current_user.email, name=current_user.full_name or "")
        current_user.stripe_customer_id = customer.id
        await db.commit()

    session = stripe.checkout.Session.create(
        customer=current_user.stripe_customer_id,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url=f"{settings.FRONTEND_URL}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{settings.FRONTEND_URL}/checkout/cancel",
        metadata={"user_id": str(current_user.id), "plan": body.plan},
        subscription_data={"trial_period_days": 7},
    )
    return CheckoutSessionResponse(checkout_url=session.url)


@router.get("/me", response_model=SubscriptionOut)
async def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Subscription).where(Subscription.user_id == current_user.id))
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="No subscription found")
    return sub


@router.delete("/me", response_model=MessageResponse)
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Subscription).where(Subscription.user_id == current_user.id))
    sub = result.scalar_one_or_none()
    if not sub or not sub.stripe_subscription_id:
        raise HTTPException(status_code=400, detail="No active paid subscription to cancel")

    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Stripe not configured")

    stripe.Subscription.modify(sub.stripe_subscription_id, cancel_at_period_end=True)
    sub.cancel_at_period_end = True
    await db.commit()
    return MessageResponse(message="Subscription will be canceled at period end")


@router.get("/usage", response_model=UsageOut)
async def get_usage(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    stat_result = await db.execute(
        select(UsageStat).where(
            UsageStat.user_id == current_user.id,
            UsageStat.year == now.year,
            UsageStat.month == now.month,
        )
    )
    stat = stat_result.scalar_one_or_none()
    count = stat.request_count if stat else 0

    sub_result = await db.execute(select(Subscription).where(Subscription.user_id == current_user.id))
    sub = sub_result.scalar_one_or_none()
    plan = sub.plan if sub else "starter"

    if current_user.is_superuser:
        plan = "enterprise"

    limit = settings.PLAN_LIMITS.get(plan, {}).get("max_requests", 1000)
    return UsageOut(request_count=count, limit=limit, plan=plan)
