from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext
import secrets
import string

from config.settings import settings

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(subject: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": subject, "role": role, "token_use": "access", "exp": expire}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"sub": subject, "token_use": "refresh", "exp": expire}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_reset_token(subject: str) -> str:
    """Create a password reset token."""
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_RESET_TOKEN_EXPIRE_HOURS)
    to_encode = {"sub": subject, "token_use": "reset", "exp": expire}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_verification_token(subject: str) -> str:
    """Create an email verification token."""
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_VERIFICATION_TOKEN_EXPIRE_HOURS)
    to_encode = {"sub": subject, "token_use": "verification", "exp": expire}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def generate_random_token(length: int = 32) -> str:
    """Generate a random secure token."""
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))
