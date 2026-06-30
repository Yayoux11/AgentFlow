import logging
from cryptography.fernet import Fernet
from app.config import settings

logger = logging.getLogger(__name__)

_fernet: Fernet | None = None


def _get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        key = settings.ENCRYPTION_KEY
        if not key:
            # Dev fallback — generate a stable key from SECRET_KEY
            import base64, hashlib
            raw = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
            key = base64.urlsafe_b64encode(raw).decode()
            logger.warning("ENCRYPTION_KEY not set — using derived dev key. Set it in .env for production.")
        _fernet = Fernet(key.encode() if isinstance(key, str) else key)
    return _fernet


def encrypt_token(token: str) -> str:
    return _get_fernet().encrypt(token.encode()).decode()


def decrypt_token(encrypted: str) -> str:
    return _get_fernet().decrypt(encrypted.encode()).decode()
