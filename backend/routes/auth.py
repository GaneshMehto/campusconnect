from typing import Annotated
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.exc import IntegrityError, OperationalError
from sqlalchemy.orm import Session

from auth.security import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    create_reset_token, create_verification_token
)
from config.settings import settings
from database.deps import get_db
from models.enums import UserRole
from models.user import User
from models.student import Student
from models.recruiter import Recruiter
from schemas.auth import (
    Token, RegisterStudentRequest, RegisterRecruiterRequest, LoginRequest, 
    LoginResponse, RefreshTokenRequest, ForgotPasswordRequest, ResetPasswordRequest,
    VerifyEmailRequest, ResendVerificationRequest
)
from services.email import email_service

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


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Annotated[Session, Depends(get_db)]):
    """Initiate password reset by sending a reset email."""
    try:
        user = db.query(User).filter(User.email == payload.email).first()
    except OperationalError:
        raise HTTPException(status_code=503, detail="Database unavailable")

    # Always return success for security (don't leak if email exists)
    if not user:
        return {"message": "If that email is registered, we've sent a password reset link"}

    # Generate reset token
    reset_token = create_reset_token(subject=str(user.id))
    user.reset_token = reset_token
    user.reset_token_expiry = datetime.now(timezone.utc).replace(microsecond=0) + __import__('datetime').timedelta(
        hours=settings.JWT_RESET_TOKEN_EXPIRE_HOURS
    )

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to initiate password reset")

    # Send reset email
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    full_name = getattr(user.student_profile, 'full_name', None) or getattr(user.recruiter_profile, 'full_name', None)
    
    email_service.send_password_reset_email(user.email, reset_url, full_name)

    return {"message": "If that email is registered, we've sent a password reset link"}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Annotated[Session, Depends(get_db)]):
    """Reset password using a valid reset token."""
    try:
        data = jwt.decode(payload.token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = int(data.get("sub") or 0)
    except (JWTError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    if data.get("token_use") != "reset" or not user_id:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    try:
        user = db.get(User, user_id)
    except OperationalError:
        raise HTTPException(status_code=503, detail="Database unavailable")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check token expiry
    if not user.reset_token_expiry or user.reset_token_expiry < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token has expired")

    # Update password and clear reset token
    user.password_hash = hash_password(payload.password)
    user.reset_token = None
    user.reset_token_expiry = None

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to reset password")

    return {"message": "Password reset successfully"}


@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest, db: Annotated[Session, Depends(get_db)]):
    """Verify email address using verification token."""
    try:
        data = jwt.decode(payload.token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = int(data.get("sub") or 0)
    except (JWTError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    if data.get("token_use") != "verification" or not user_id:
        raise HTTPException(status_code=400, detail="Invalid verification token")

    try:
        user = db.get(User, user_id)
    except OperationalError:
        raise HTTPException(status_code=503, detail="Database unavailable")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check token expiry
    if not user.verification_token_expiry or user.verification_token_expiry < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Verification token has expired")

    # Mark email as verified and clear verification token
    user.is_verified = True
    user.verification_token = None
    user.verification_token_expiry = None

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to verify email")

    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
def resend_verification(payload: ResendVerificationRequest, db: Annotated[Session, Depends(get_db)]):
    """Resend email verification link."""
    try:
        user = db.query(User).filter(User.email == payload.email).first()
    except OperationalError:
        raise HTTPException(status_code=503, detail="Database unavailable")

    # Always return success for security
    if not user:
        return {"message": "If that email is registered and not verified, we've sent a verification link"}

    if user.is_verified:
        return {"message": "Email is already verified"}

    # Generate verification token
    verification_token = create_verification_token(subject=str(user.id))
    user.verification_token = verification_token
    user.verification_token_expiry = datetime.now(timezone.utc).replace(microsecond=0) + __import__('datetime').timedelta(
        hours=settings.JWT_VERIFICATION_TOKEN_EXPIRE_HOURS
    )

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to resend verification email")

    # Send verification email
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
    full_name = getattr(user.student_profile, 'full_name', None) or getattr(user.recruiter_profile, 'full_name', None)
    
    email_service.send_verification_email(user.email, verification_url, full_name)

    return {"message": "If that email is registered and not verified, we've sent a verification link"}
