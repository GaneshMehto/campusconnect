from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from auth.deps import require_roles
from database.deps import get_db
from models.job import Job
from models.company import Company
from models.recruiter import Recruiter
from models.student import Student
from models.application import Application
from models.user import User
from schemas.jobs import JobCreate, JobOut
from services.skill_match import compute_match_score

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/", response_model=list[JobOut])
def list_jobs(
    db: Annotated[Session, Depends(get_db)],
    q: str | None = None,
    is_internship: bool | None = None,
    company_id: int | None = None,
    page: int = 1,
    page_size: int = 10,
):
    query = db.query(Job)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(Job.title.ilike(like), Job.description.ilike(like)))
    if is_internship is not None:
        query = query.filter(Job.is_internship == is_internship)
    if company_id:
        query = query.filter(Job.company_id == company_id)

    query = query.order_by(Job.created_at.desc())
    return query.offset((page - 1) * page_size).limit(page_size).all()


@router.get("/recommended", response_model=list[JobOut])
def recommended_jobs(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("student"))],
    limit: int = 10,
):
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    applied_job_ids = {
        job_id for (job_id,) in db.query(Application.job_id).filter(Application.student_id == student.id).all()
    }
    jobs = db.query(Job).order_by(Job.created_at.desc()).limit(100).all()
    skills = [s.name for s in student.skills]

    ranked = sorted(
        [job for job in jobs if job.id not in applied_job_ids],
        key=lambda job: compute_match_score(skills, job.requirements),
        reverse=True,
    )
    return ranked[: max(1, min(limit, 50))]


@router.post("/", response_model=JobOut, status_code=201)
def create_job(
    payload: JobCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("recruiter"))],
):
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")

    company = db.get(Company, payload.company_id)
    if not company or company.recruiter_id != recruiter.id:
        raise HTTPException(status_code=403, detail="Company not found or not owned")

    job = Job(**payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("recruiter", "admin"))],
):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if user.role.value == "recruiter":
        recruiter = db.query(Recruiter).filter(Recruiter.user_id == user.id).first()
        company = db.get(Company, job.company_id)
        if not recruiter or not company or company.recruiter_id != recruiter.id:
            raise HTTPException(status_code=403, detail="Not allowed")

    db.delete(job)
    db.commit()
    return {"ok": True}
