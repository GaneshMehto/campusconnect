from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.deps import require_roles
from database.deps import get_db
from models.interview import Interview
from models.application import Application
from models.company import Company
from models.job import Job
from models.recruiter import Recruiter
from models.user import User
from models.enums import ApplicationStatus
from schemas.interviews import InterviewCreate, InterviewOut, InterviewUpdate
from services.notifications import create_notification

router = APIRouter(prefix="/interviews", tags=["interviews"])


@router.post("/", response_model=InterviewOut, status_code=201)
def schedule_interview(
    payload: InterviewCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("recruiter", "admin"))],
):
    app = db.get(Application, payload.application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if user.role.value == "recruiter":
        recruiter = db.query(Recruiter).filter(Recruiter.user_id == user.id).first()
        if not recruiter:
            raise HTTPException(status_code=404, detail="Recruiter profile not found")

        job = db.get(Job, app.job_id)
        company = db.get(Company, job.company_id) if job else None
        if not job or not company or company.recruiter_id != recruiter.id:
            raise HTTPException(status_code=403, detail="Not allowed")

    interview = Interview(**payload.model_dump())
    db.add(interview)
    app.status = ApplicationStatus.interview_scheduled
    db.commit()
    db.refresh(interview)

    create_notification(
        db,
        user_id=app.student.user_id,
        title="Interview Scheduled",
        message=f"Interview scheduled at {payload.scheduled_at.isoformat()} ({payload.mode}).",
    )

    return interview


@router.get("/me", response_model=list[InterviewOut])
def my_interviews(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("student", "recruiter", "admin"))],
):
    query = db.query(Interview).join(Application, Interview.application_id == Application.id)

    if user.role.value == "student":
        query = query.filter(Application.student.has(user_id=user.id))

    if user.role.value == "recruiter":
        recruiter = db.query(Recruiter).filter(Recruiter.user_id == user.id).first()
        if not recruiter:
            raise HTTPException(status_code=404, detail="Recruiter profile not found")
        query = (
            query.join(Job, Application.job_id == Job.id)
            .join(Company, Job.company_id == Company.id)
            .filter(Company.recruiter_id == recruiter.id)
        )

    return query.order_by(Interview.scheduled_at.asc()).all()


@router.put("/{interview_id}", response_model=InterviewOut)
def update_interview(
    interview_id: int,
    payload: InterviewUpdate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("recruiter", "admin"))],
):
    interview = db.get(Interview, interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    if user.role.value == "recruiter":
        recruiter = db.query(Recruiter).filter(Recruiter.user_id == user.id).first()
        app = db.get(Application, interview.application_id)
        job = db.get(Job, app.job_id) if app else None
        company = db.get(Company, job.company_id) if job else None
        if not recruiter or not company or company.recruiter_id != recruiter.id:
            raise HTTPException(status_code=403, detail="Not allowed")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(interview, key, value)

    db.commit()
    db.refresh(interview)
    return interview
