from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from auth.deps import require_roles
from database.deps import get_db
from models.application import Application
from models.company import Company
from models.job import Job
from models.recruiter import Recruiter
from models.student import Student
from models.user import User
from schemas.applications import ApplyRequest, ApplicationOut, UpdateApplicationStatus
from services.skill_match import compute_match_score
from services.notifications import create_notification

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("/apply", response_model=ApplicationOut, status_code=201)
def apply(
    payload: ApplyRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("student"))],
):
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    job = db.get(Job, payload.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = db.query(Application).filter(Application.student_id == student.id, Application.job_id == job.id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already applied")

    student_skill_names = [s.name for s in student.skills]
    score = compute_match_score(student_skill_names, job.requirements)

    app = Application(student_id=student.id, job_id=job.id, match_score=score)
    db.add(app)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Already applied")
    db.refresh(app)

    create_notification(db, user_id=user.id, title="Application Submitted", message=f"Applied to {job.title} (Match: {score}%).")
    company = db.get(Company, job.company_id)
    recruiter = db.get(Recruiter, company.recruiter_id) if company else None
    if recruiter:
        create_notification(
            db,
            user_id=recruiter.user_id,
            title="New Application",
            message=f"A student applied to {job.title} with a {score}% match score.",
        )
    return app


@router.get("/me", response_model=list[ApplicationOut])
def my_applications(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("student"))],
):
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    return db.query(Application).filter(Application.student_id == student.id).order_by(Application.created_at.desc()).all()


@router.put("/{application_id}/status", response_model=ApplicationOut)
def update_status(
    application_id: int,
    payload: UpdateApplicationStatus,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("recruiter", "admin"))],
):
    app = db.get(Application, application_id)
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

    app.status = payload.status
    db.commit()
    db.refresh(app)

    create_notification(
        db,
        user_id=app.student.user_id,
        title="Application Update",
        message=f"Your application status is now: {app.status.value}",
    )
    return app
