from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_db, require_superuser
from app.models import AgentRequest, Subscription, User
from app.schemas import AdminStatsOut

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStatsOut, dependencies=[Depends(require_superuser)])
async def admin_stats(db: AsyncSession = Depends(get_db)):
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar_one()

    active_subs = (
        await db.execute(
            select(func.count())
            .select_from(Subscription)
            .where(Subscription.status == "active", Subscription.plan != "starter")
        )
    ).scalar_one()

    today = datetime.now(timezone.utc).date()
    today_requests = (
        await db.execute(
            select(func.count())
            .select_from(AgentRequest)
            .where(func.date(AgentRequest.created_at) == today)
        )
    ).scalar_one()

    # Revenue estimate: pro=$29, enterprise=$99
    pro_count = (
        await db.execute(
            select(func.count())
            .select_from(Subscription)
            .where(Subscription.status == "active", Subscription.plan == "pro")
        )
    ).scalar_one()
    enterprise_count = (
        await db.execute(
            select(func.count())
            .select_from(Subscription)
            .where(Subscription.status == "active", Subscription.plan == "enterprise")
        )
    ).scalar_one()
    revenue = pro_count * 29.0 + enterprise_count * 99.0

    return AdminStatsOut(
        total_users=total_users,
        active_subscriptions=active_subs,
        total_requests_today=today_requests,
        total_revenue_estimate=revenue,
    )
