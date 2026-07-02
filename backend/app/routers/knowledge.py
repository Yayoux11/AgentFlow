"""Knowledge base management — document upload, list, delete."""
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user, get_db
from app.models import KnowledgeBase, KnowledgeChunk, User
from app.schemas import KnowledgeBaseOut, MessageResponse
from app.services.rag import ingest_document

router = APIRouter(prefix="/knowledge", tags=["knowledge"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("", response_model=KnowledgeBaseOut, status_code=201)
async def upload_document(
    name: str = Form(...),
    agent_slug: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ("application/pdf", "text/plain", "text/markdown"):
        raise HTTPException(status_code=400, detail="Seuls PDF, TXT et MD sont acceptés")

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Fichier trop volumineux (max 10 Mo)")

    kb = await ingest_document(
        db=db,
        user_id=current_user.id,
        agent_slug=agent_slug or None,
        name=name,
        filename=file.filename or "document",
        data=data,
    )
    return kb


@router.get("", response_model=List[KnowledgeBaseOut])
async def list_knowledge_bases(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(KnowledgeBase)
        .where(KnowledgeBase.user_id == current_user.id)
        .order_by(KnowledgeBase.created_at.desc())
    )
    return result.scalars().all()


@router.delete("/{kb_id}", response_model=MessageResponse)
async def delete_knowledge_base(
    kb_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(KnowledgeBase).where(
            KnowledgeBase.id == kb_id,
            KnowledgeBase.user_id == current_user.id,
        )
    )
    kb = result.scalar_one_or_none()
    if not kb:
        raise HTTPException(status_code=404, detail="Base de connaissances introuvable")
    await db.delete(kb)
    await db.commit()
    return MessageResponse(message="Base de connaissances supprimée")
