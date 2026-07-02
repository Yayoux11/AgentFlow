"""RAG service — document ingestion and context retrieval."""
import io
import json
import logging
import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import KnowledgeBase, KnowledgeChunk
from app.services.embeddings import chunk_text, cosine_similarity, get_embedding

logger = logging.getLogger(__name__)


def _extract_text_from_pdf(data: bytes) -> str:
    from pypdf import PdfReader
    reader = PdfReader(io.BytesIO(data))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def _extract_text_from_txt(data: bytes) -> str:
    for enc in ("utf-8", "latin-1"):
        try:
            return data.decode(enc)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")


def extract_text(data: bytes, filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext == "pdf":
        return _extract_text_from_pdf(data)
    return _extract_text_from_txt(data)


async def ingest_document(
    db: AsyncSession,
    user_id: uuid.UUID,
    agent_slug: Optional[str],
    name: str,
    filename: str,
    data: bytes,
) -> KnowledgeBase:
    text = extract_text(data, filename)
    chunks = chunk_text(text)

    kb = KnowledgeBase(
        user_id=user_id,
        agent_slug=agent_slug,
        name=name,
        file_name=filename,
        chunk_count=len(chunks),
        status="processing",
    )
    db.add(kb)
    await db.flush()

    for i, chunk in enumerate(chunks):
        embedding = await get_embedding(chunk)
        db.add(KnowledgeChunk(
            kb_id=kb.id,
            content=chunk,
            embedding=embedding,
            chunk_index=i,
        ))

    kb.status = "ready"
    await db.commit()
    await db.refresh(kb)
    return kb


async def retrieve_context(
    db: AsyncSession,
    user_id: uuid.UUID,
    query: str,
    agent_slug: Optional[str] = None,
    top_k: int = 3,
    min_score: float = 0.65,
) -> str:
    query_vec = await get_embedding(query)
    if query_vec is None:
        return ""

    kb_q = select(KnowledgeBase).where(
        KnowledgeBase.user_id == user_id,
        KnowledgeBase.status == "ready",
    )
    if agent_slug:
        kb_q = kb_q.where(
            (KnowledgeBase.agent_slug == agent_slug) | (KnowledgeBase.agent_slug.is_(None))
        )
    kb_result = await db.execute(kb_q)
    kbs = kb_result.scalars().all()
    if not kbs:
        return ""

    kb_ids = [kb.id for kb in kbs]
    chunks_result = await db.execute(
        select(KnowledgeChunk).where(KnowledgeChunk.kb_id.in_(kb_ids))
    )
    chunks = chunks_result.scalars().all()

    scored = []
    for chunk in chunks:
        if not chunk.embedding:
            continue
        score = cosine_similarity(query_vec, chunk.embedding)
        if score >= min_score:
            scored.append((score, chunk.content))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:top_k]

    if not top:
        return ""

    parts = [f"[Context {i+1}]:\n{content}" for i, (_, content) in enumerate(top)]
    return "\n\n".join(parts)
