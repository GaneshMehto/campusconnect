from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from auth.deps import require_roles
from database.deps import get_db
from models.recruiter import Recruiter
from models.user import User
from models.job import Job
from models.application import Application
from models.notification import Notification
from models.enums import UserRole, ApplicationStatus
from schemas.admin import (
    RecruiterApprovalRequest,
    AdminUsersPage,
    AdminUserOut,
    AdminSetUserActiveRequest,
    AdminJobsPage,
    AdminJobOut,
    AdminApplicationsPage,
    AdminApplicationOut,
    AdminBroadcastNotificationRequest,
    AdminBroadcastNotificationResponse,
)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/recruiters/pending")
def pending_recruiters(
    db: Annotated[Session, Depends(get_db)],
    _admin=Depends(require_roles("admin")),
):
    items = db.query(Recruiter).filter(Recruiter.is_approved == False).order_by(Recruiter.created_at.desc()).all()  # noqa: E712
    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "full_name": r.full_name,
            "phone": r.phone,
            "is_approved": r.is_approved,
            "created_at": r.created_at,
        }
        for r in items
    ]


@router.put("/recruiters/{recruiter_id}/approval")
def set_recruiter_approval(
    recruiter_id: int,
    payload: RecruiterApprovalRequest,
    db: Annotated[Session, Depends(get_db)],
    _admin=Depends(require_roles("admin")),
):
    r = db.get(Recruiter, recruiter_id)
    if not r:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    r.is_approved = payload.is_approved
    db.commit()
    return {"ok": True, "recruiter_id": r.id, "is_approved": r.is_approved}


@router.get("/users", response_model=AdminUsersPage)
def list_users(
    db: Annotated[Session, Depends(get_db)],
    _admin=Depends(require_roles("admin")),
    q: str | None = None,
    role: str | None = None,
    is_active: bool | None = None,
    page: int = 1,
    page_size: int = 20,
):
    page = max(1, page)
    page_size = min(max(1, page_size), 100)

    query = db.query(User)
    if q:
        like = f"%{q}%"
        query = query.filter(User.email.ilike(like))
    if role:
        try:
            query = query.filter(User.role == UserRole(role))
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid role")
    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    total = query.with_entities(func.count(User.id)).scalar() or 0
    items = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [
            AdminUserOut(
                id=u.id,
                email=u.email,
                role=u.role.value if hasattr(u.role, "value") else str(u.role),
                is_active=bool(u.is_active),
                is_verified=bool(u.is_verified),
                created_at=u.created_at,
            )
            for u in items
        ],
        "page": page,
        "page_size": page_size,
        "total": total,
    }


@router.put("/users/{user_id}/active")
def set_user_active(
    user_id: int,
    payload: AdminSetUserActiveRequest,
    db: Annotated[Session, Depends(get_db)],
    _admin=Depends(require_roles("admin")),
):
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u.is_active = payload.is_active
    db.commit()
    return {"ok": True, "user_id": u.id, "is_active": u.is_active}


@router.get("/jobs", response_model=AdminJobsPage)
def list_jobs_admin(
    db: Annotated[Session, Depends(get_db)],
    _admin=Depends(require_roles("admin")),
    q: str | None = None,
    company_id: int | None = None,
    is_internship: bool | None = None,
    page: int = 1,
    page_size: int = 20,
):
    page = max(1, page)
    page_size = min(max(1, page_size), 100)

    query = db.query(Job)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(Job.title.ilike(like), Job.description.ilike(like)))
    if company_id is not None:
        query = query.filter(Job.company_id == company_id)
    if is_internship is not None:
        query = query.filter(Job.is_internship == is_internship)

    total = query.with_entities(func.count(Job.id)).scalar() or 0
    items = query.order_by(Job.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [
            AdminJobOut(
                id=j.id,
                title=j.title,
                company_id=j.company_id,
                location=j.location,
                is_internship=bool(j.is_internship),
                created_at=j.created_at,
            )
            for j in items
        ],
        "page": page,
        "page_size": page_size,
        "total": total,
    }


@router.delete("/jobs/{job_id}")
def delete_job_admin(
    job_id: int,
    db: Annotated[Session, Depends(get_db)],
    _admin=Depends(require_roles("admin")),
):
    j = db.get(Job, job_id)
    if not j:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(j)
    db.commit()
    return {"ok": True}


@router.get("/applications", response_model=AdminApplicationsPage)
def list_applications_admin(
    db: Annotated[Session, Depends(get_db)],
    _admin=Depends(require_roles("admin")),
    job_id: int | None = None,
    student_id: int | None = None,
    status: str | None = None,
    page: int = 1,
    page_size: int = 20,
):
    page = max(1, page)
    page_size = min(max(1, page_size), 100)

    query = db.query(Application)
    if job_id is not None:
        query = query.filter(Application.job_id == job_id)
    if student_id is not None:
        query = query.filter(Application.student_id == student_id)
    if status:
        try:
            query = query.filter(Application.status == ApplicationStatus(status))
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid application status")

    total = query.with_entities(func.count(Application.id)).scalar() or 0
    items = query.order_by(Application.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [
            AdminApplicationOut(
                id=a.id,
                job_id=a.job_id,
                student_id=a.student_id,
                status=a.status.value if hasattr(a.status, "value") else str(a.status),
                match_score=a.match_score,
                created_at=a.created_at,
            )
            for a in items
        ],
        "page": page,
        "page_size": page_size,
        "total": total,
    }


@router.post("/notifications/broadcast", response_model=AdminBroadcastNotificationResponse)
def broadcast_notification(
    payload: AdminBroadcastNotificationRequest,
    db: Annotated[Session, Depends(get_db)],
    _admin=Depends(require_roles("admin")),
):
    if not payload.title.strip() or not payload.message.strip():
        raise HTTPException(status_code=422, detail="Title and message are required")

    query = db.query(User).filter(User.is_active == True)  # noqa: E712
    if payload.roles:
        try:
            roles = [UserRole(role) for role in payload.roles]
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid role in broadcast target")
        query = query.filter(User.role.in_(roles))

    users = query.all()
    sent = 0

    for u in users:
        db.add(Notification(user_id=u.id, title=payload.title.strip(), message=payload.message.strip()))
        sent += 1

    db.commit()
    return {"ok": True, "sent": sent}
