from pydantic import BaseModel, EmailStr
from datetime import datetime


class RecruiterApprovalRequest(BaseModel):
    is_approved: bool


class AdminUserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime | None = None


class AdminUsersPage(BaseModel):
    items: list[AdminUserOut]
    page: int
    page_size: int
    total: int


class AdminSetUserActiveRequest(BaseModel):
    is_active: bool


class AdminJobOut(BaseModel):
    id: int
    title: str
    company_id: int
    location: str | None = None
    is_internship: bool
    created_at: datetime | None = None


class AdminJobsPage(BaseModel):
    items: list[AdminJobOut]
    page: int
    page_size: int
    total: int


class AdminApplicationOut(BaseModel):
    id: int
    job_id: int
    student_id: int
    status: str
    match_score: int | None = None
    created_at: datetime | None = None


class AdminApplicationsPage(BaseModel):
    items: list[AdminApplicationOut]
    page: int
    page_size: int
    total: int


class AdminBroadcastNotificationRequest(BaseModel):
    title: str
    message: str
    roles: list[str] | None = None  # e.g. ["student", "recruiter"] ; null => all roles


class AdminBroadcastNotificationResponse(BaseModel):
    ok: bool
    sent: int
