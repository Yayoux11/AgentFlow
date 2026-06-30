"""
Create the superuser account.

Usage:
    cd backend
    python -m scripts.create_superuser
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import select
from app.database import AsyncSessionLocal, engine, Base
from app.models import User, Subscription
from app.auth import hash_password


SUPERUSER_EMAIL = "yayadu56530@gmail.com"
SUPERUSER_PASSWORD = "Admin@2026!"
SUPERUSER_NAME = "Admin"


async def main():
    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == SUPERUSER_EMAIL))
        existing = result.scalar_one_or_none()

        if existing:
            # Update to superuser if not already
            if not existing.is_superuser:
                existing.is_superuser = True
                await db.commit()
                print(f"✓ Upgraded '{SUPERUSER_EMAIL}' to superuser.")
            else:
                print(f"✓ Superuser '{SUPERUSER_EMAIL}' already exists.")
            return

        user = User(
            email=SUPERUSER_EMAIL,
            hashed_password=hash_password(SUPERUSER_PASSWORD),
            full_name=SUPERUSER_NAME,
            is_superuser=True,
            is_active=True,
        )
        db.add(user)
        await db.flush()

        # Enterprise subscription — unlimited access
        sub = Subscription(
            user_id=user.id,
            plan="enterprise",
            status="active",
        )
        db.add(sub)
        await db.commit()

        print("=" * 50)
        print("✅ Superuser created successfully!")
        print(f"   Email    : {SUPERUSER_EMAIL}")
        print(f"   Password : {SUPERUSER_PASSWORD}")
        print(f"   Plan     : enterprise (unlimited)")
        print("=" * 50)
        print("⚠️  Change this password immediately in production!")


if __name__ == "__main__":
    asyncio.run(main())
