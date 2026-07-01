import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user, get_db
from app.models import Notification, User

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NotificationOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    type: str
    title: str
    body: str
    read: bool
    created_at: datetime


@router.get("", response_model=List[NotificationOut])
async def list_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    return result.scalars().all()


@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        update(Notification)
        .where(Notification.id == notification_id, Notification.user_id == current_user.id)
        .values(read=True)
    )
    await db.commit()
    return {"ok": True}


@router.patch("/read-all")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.read == False)
        .values(read=True)
    )
    await db.commit()
    return {"ok": True}
