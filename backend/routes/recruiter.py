from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.deps import require_roles
from database.deps import get_db
from models.application import Application
from models.company import Company
from models.job import Job
from models.recruiter import Recruiter
from models.user import User
from schemas.applications import ApplicationOut
from schemas.jobs import JobCreate, JobOut, JobUpdate

router = APIRouter(prefix="/recruiter", tags=["recruiter"])


def _get_recruiter(db: Session, user: User) -> Recruiter:
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    return recruiter


def _assert_company_owned(db: Session, recruiter: Recruiter, company_id: int) -> Company:
    company = db.get(Company, company_id)
    if not company or company.recruiter_id != recruiter.id:
        raise HTTPException(status_code=403, detail="Company not found or not owned")
    return company


@router.post("/jobs", response_model=JobOut, status_code=201)
def create_recruiter_job(
    payload: JobCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("recruiter"))],
):
    recruiter = _get_recruiter(db, user)
    _assert_company_owned(db, recruiter, payload.company_id)

    job = Job(**payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("/jobs", response_model=list[JobOut])
def list_recruiter_jobs(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("recruiter"))],
    company_id: int | None = None,
    page: int = 1,
    page_size: int = 10,
):
    recruiter = _get_recruiter(db, user)

    q = db.query(Job).join(Company, Job.company_id == Company.id).filter(Company.recruiter_id == recruiter.id)
    if company_id is not None:
        q = q.filter(Job.company_id == company_id)

    q = q.order_by(Job.created_at.desc())
    return q.offset((page - 1) * page_size).limit(page_size).all()


@router.put("/jobs/{job_id}", response_model=JobOut)
def update_recruiter_job(
    job_id: int,
    payload: JobUpdate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("recruiter"))],
):
    recruiter = _get_recruiter(db, user)

    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    company = db.get(Company, job.company_id)
    if not company or company.recruiter_id != recruiter.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(job, k, v)

    db.commit()
    db.refresh(job)
    return job


@router.delete("/jobs/{job_id}")
def delete_recruiter_job(
    job_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("recruiter"))],
):
    recruiter = _get_recruiter(db, user)

    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    company = db.get(Company, job.company_id)
    if not company or company.recruiter_id != recruiter.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    db.delete(job)
    db.commit()
    return {"ok": True}


@router.get("/jobs/{job_id}/applicants", response_model=list[ApplicationOut])
def list_applicants(
    job_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("recruiter"))],
):
    recruiter = _get_recruiter(db, user)

    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    company = db.get(Company, job.company_id)
    if not company or company.recruiter_id != recruiter.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    return db.query(Application).filter(Application.job_id == job.id).order_by(Application.created_at.desc()).all()
