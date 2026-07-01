import secrets
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.deps import get_current_user, get_db
from app.models import Subscription, Team, TeamInvitation, TeamMember, User
from app.schemas import InviteRequest, MessageResponse, TeamCreate, TeamMemberOut, TeamOut
from app.services.email_service import send_team_invitation_email

router = APIRouter(prefix="/team", tags=["team"])

INVITE_TTL_HOURS = 48


async def _require_enterprise(user: User, db: AsyncSession) -> None:
    if user.is_superuser:
        return
    result = await db.execute(select(Subscription).where(Subscription.user_id == user.id))
    sub = result.scalar_one_or_none()
    if not sub or sub.plan != "enterprise" or sub.status not in ("active", "trialing"):
        raise HTTPException(status_code=403, detail="Plan Enterprise requis pour gérer une équipe")


async def _get_my_team_as_owner(user: User, db: AsyncSession) -> Team:
    result = await db.execute(select(Team).where(Team.owner_id == user.id))
    team = result.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Aucune équipe trouvée")
    return team


async def _build_team_out(team: Team, db: AsyncSession) -> dict:
    members_result = await db.execute(
        select(TeamMember, User).join(User, User.id == TeamMember.user_id).where(TeamMember.team_id == team.id)
    )
    members = [
        TeamMemberOut(id=m.id, user_id=m.user_id, joined_at=m.joined_at, email=u.email, full_name=u.full_name)
        for m, u in members_result.all()
    ]
    invitations_result = await db.execute(
        select(TeamInvitation).where(TeamInvitation.team_id == team.id, TeamInvitation.status == "pending")
    )
    invitations = invitations_result.scalars().all()
    return {
        "id": team.id,
        "name": team.name,
        "created_at": team.created_at,
        "members": members,
        "invitations": invitations,
    }


# ---------------------------------------------------------------------------
# Create team
# ---------------------------------------------------------------------------

@router.post("", response_model=TeamOut, status_code=201)
async def create_team(
    body: TeamCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_enterprise(current_user, db)
    existing = await db.execute(select(Team).where(Team.owner_id == current_user.id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Vous avez déjà une équipe")
    team = Team(owner_id=current_user.id, name=body.name)
    db.add(team)
    await db.commit()
    await db.refresh(team)
    return await _build_team_out(team, db)


# ---------------------------------------------------------------------------
# Get my team (owner or member)
# ---------------------------------------------------------------------------

@router.get("/me", response_model=TeamOut)
async def get_my_team(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check if owner
    owner_result = await db.execute(select(Team).where(Team.owner_id == current_user.id))
    team = owner_result.scalar_one_or_none()

    if not team:
        # Check if member
        member_result = await db.execute(
            select(TeamMember).where(TeamMember.user_id == current_user.id)
        )
        membership = member_result.scalar_one_or_none()
        if not membership:
            raise HTTPException(status_code=404, detail="Aucune équipe trouvée")
        team_result = await db.execute(select(Team).where(Team.id == membership.team_id))
        team = team_result.scalar_one_or_none()

    return await _build_team_out(team, db)


# ---------------------------------------------------------------------------
# Invite member
# ---------------------------------------------------------------------------

@router.post("/invite", response_model=MessageResponse)
async def invite_member(
    body: InviteRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_enterprise(current_user, db)
    team = await _get_my_team_as_owner(current_user, db)

    # Check not already a member
    target_result = await db.execute(select(User).where(User.email == body.email))
    target = target_result.scalar_one_or_none()
    if target:
        if target.id == current_user.id:
            raise HTTPException(status_code=400, detail="Vous êtes déjà propriétaire de l'équipe")
        member_check = await db.execute(
            select(TeamMember).where(TeamMember.team_id == team.id, TeamMember.user_id == target.id)
        )
        if member_check.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Cet utilisateur est déjà membre de l'équipe")

    # Cancel existing pending invitation for this email
    existing_inv = await db.execute(
        select(TeamInvitation).where(
            TeamInvitation.team_id == team.id,
            TeamInvitation.email == body.email,
            TeamInvitation.status == "pending",
        )
    )
    old = existing_inv.scalar_one_or_none()
    if old:
        old.status = "declined"

    token = secrets.token_urlsafe(48)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=INVITE_TTL_HOURS)
    invitation = TeamInvitation(team_id=team.id, email=body.email, token=token, expires_at=expires_at)
    db.add(invitation)
    await db.commit()

    invite_url = f"{settings.FRONTEND_URL}/team/accept?token={token}"
    background_tasks.add_task(
        send_team_invitation_email,
        body.email,
        invite_url,
        team.name,
        current_user.full_name or current_user.email,
    )
    return MessageResponse(message=f"Invitation envoyée à {body.email}")


# ---------------------------------------------------------------------------
# Accept invitation (public endpoint — token in query)
# ---------------------------------------------------------------------------

@router.post("/accept", response_model=MessageResponse)
async def accept_invitation(
    token: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(TeamInvitation).where(TeamInvitation.token == token))
    inv = result.scalar_one_or_none()
    if not inv or inv.status != "pending":
        raise HTTPException(status_code=400, detail="Invitation invalide ou déjà utilisée")
    if inv.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invitation expirée")
    if inv.email != current_user.email:
        raise HTTPException(status_code=403, detail="Cette invitation ne vous est pas destinée")

    # Add as member
    member = TeamMember(team_id=inv.team_id, user_id=current_user.id)
    db.add(member)
    inv.status = "accepted"
    await db.commit()
    return MessageResponse(message="Vous avez rejoint l'équipe !")


# ---------------------------------------------------------------------------
# Remove member (owner only)
# ---------------------------------------------------------------------------

@router.delete("/members/{user_id}", response_model=MessageResponse)
async def remove_member(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    team = await _get_my_team_as_owner(current_user, db)
    result = await db.execute(
        select(TeamMember).where(TeamMember.team_id == team.id, TeamMember.user_id == user_id)
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Membre introuvable")
    await db.delete(member)
    await db.commit()
    return MessageResponse(message="Membre retiré de l'équipe")


# ---------------------------------------------------------------------------
# Delete team (owner only)
# ---------------------------------------------------------------------------

@router.delete("", response_model=MessageResponse)
async def delete_team(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    team = await _get_my_team_as_owner(current_user, db)
    await db.delete(team)
    await db.commit()
    return MessageResponse(message="Équipe supprimée")
