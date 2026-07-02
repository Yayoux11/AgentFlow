"""Embedding service — OpenAI text-embedding-3-small. Gracefully disabled if no key."""
import logging
import math
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)

EMBEDDING_DIM = 1536
EMBEDDING_MODEL = "text-embedding-3-small"


async def get_embedding(text: str) -> Optional[list[float]]:
    """Return embedding vector or None if OpenAI key not configured."""
    if not settings.OPENAI_API_KEY:
        return None
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.embeddings.create(model=EMBEDDING_MODEL, input=text[:8000])
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Embedding error: {e}")
        return None


def cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 150) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start += chunk_size - overlap
    return chunks
