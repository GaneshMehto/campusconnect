from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"


class RegisterStudentRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str
    department: str
    graduation_year: int


class RegisterRecruiterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str
    phone: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(Token):
    user: dict


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    """Request to initiate password reset."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Request to reset password with token."""
    token: str
    password: str = Field(min_length=8, max_length=128)


class VerifyEmailRequest(BaseModel):
    """Request to verify email."""
    token: str


class ResendVerificationRequest(BaseModel):
    """Request to resend verification email."""
    email: EmailStr
