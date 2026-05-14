from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from config.settings import settings
from database.deps import get_db
from models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")


def _decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from e


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    token: Annotated[str, Depends(oauth2_scheme)],
) -> User:
    payload = _decode_token(token)
    token_use = payload.get("token_use")
    if token_use and token_use != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    try:
        user = db.get(User, int(user_id))
    except OperationalError:
        # Avoid turning DB outages into 500s for protected routes
        raise HTTPException(status_code=503, detail="Database unavailable")

    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


def require_roles(*roles: str):
    def _role_dep(user: Annotated[User, Depends(get_current_user)]) -> User:
        # User.role is an Enum; .value is the persisted string
        if user.role.value not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        if user.role.value == "recruiter" and "recruiter" in roles:
            profile = user.recruiter_profile
            if profile and not profile.is_approved:
                raise HTTPException(status_code=403, detail="Recruiter not approved")
        return user

    return _role_dep
