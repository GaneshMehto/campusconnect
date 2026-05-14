from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.exc import IntegrityError, OperationalError
from sqlalchemy.orm import Session

from auth.security import hash_password, verify_password, create_access_token, create_refresh_token
from config.settings import settings
from database.deps import get_db
from models.enums import UserRole
from models.user import User
from models.student import Student
from models.recruiter import Recruiter
from schemas.auth import Token, RegisterStudentRequest, RegisterRecruiterRequest, LoginRequest, LoginResponse, RefreshTokenRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register/student", response_model=Token, status_code=201)
def register_student(payload: RegisterStudentRequest, db: Annotated[Session, Depends(get_db)]):
    try:
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        user = User(email=payload.email, password_hash=hash_password(payload.password), role=UserRole.student)
        db.add(user)
        db.flush()  # assigns user.id

        student = Student(
            user_id=user.id,
            full_name=payload.full_name,
            department=payload.department,
            graduation_year=payload.graduation_year,
        )
        db.add(student)
        db.commit()
        db.refresh(user)

        return _build_token(user)

    except IntegrityError:
        db.rollback()
        # Covers race conditions on unique email, or FK issues
        raise HTTPException(status_code=409, detail="Email already registered")

    except OperationalError:
        db.rollback()
        # DB down / connection refused / DNS, etc.
        raise HTTPException(status_code=503, detail="Database unavailable")

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise


@router.post("/register/recruiter", response_model=Token, status_code=201)
def register_recruiter(payload: RegisterRecruiterRequest, db: Annotated[Session, Depends(get_db)]):
    try:
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        user = User(email=payload.email, password_hash=hash_password(payload.password), role=UserRole.recruiter)
        db.add(user)
        db.flush()

        recruiter = Recruiter(user_id=user.id, full_name=payload.full_name, phone=payload.phone, is_approved=False)
        db.add(recruiter)
        db.commit()
        db.refresh(user)

        return _build_token(user)

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email already registered")

    except OperationalError:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database unavailable")

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise


def _build_user_payload(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role.value,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "created_at": user.created_at,
    }


def _build_token(user: User) -> Token:
    return Token(
        access_token=create_access_token(subject=str(user.id), role=user.role.value),
        refresh_token=create_refresh_token(subject=str(user.id)),
    )


def _check_role_state(db: Session, user: User) -> None:
    """Role-specific login guards."""
    if user.role == UserRole.recruiter:
        rec = db.query(Recruiter).filter(Recruiter.user_id == user.id).first()
        if rec and not rec.is_approved:
            raise HTTPException(status_code=403, detail="Recruiter not approved")


@router.post("/login", response_model=Token)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
):
    """OAuth2-password flow login (good for Swagger Authorize button)."""
    try:
        user = db.query(User).filter(User.email == form.username).first()
    except OperationalError:
        raise HTTPException(status_code=503, detail="Database unavailable")

    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive")

    _check_role_state(db, user)

    return _build_token(user)


@router.post("/login/json", response_model=LoginResponse)
def login_json(payload: LoginRequest, db: Annotated[Session, Depends(get_db)]):
    """JSON login endpoint (convenient for SPA/mobile clients)."""
    try:
        user = db.query(User).filter(User.email == payload.email).first()
    except OperationalError:
        raise HTTPException(status_code=503, detail="Database unavailable")

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive")

    _check_role_state(db, user)

    token = _build_token(user)
    return LoginResponse(access_token=token.access_token, refresh_token=token.refresh_token, user=_build_user_payload(user))


@router.post("/refresh", response_model=Token)
def refresh_token(payload: RefreshTokenRequest, db: Annotated[Session, Depends(get_db)]):
    try:
        data = jwt.decode(payload.refresh_token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = int(data.get("sub") or 0)
    except (JWTError, ValueError) as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from e

    if data.get("token_use") != "refresh" or not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    try:
        user = db.get(User, user_id)
    except OperationalError:
        raise HTTPException(status_code=503, detail="Database unavailable")

    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    _check_role_state(db, user)
    return _build_token(user)


@router.post("/logout")
def logout():
    # JWTs are stateless; the SPA completes logout by clearing stored tokens.
    return {"ok": True}
