import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Notification


async def create_notification(
    user_id: uuid.UUID,
    type: str,
    title: str,
    body: str,
    db: AsyncSession,
) -> None:
    db.add(Notification(user_id=user_id, type=type, title=title, body=body))
