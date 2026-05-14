from typing import Annotated
from collections import Counter, defaultdict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from auth.deps import require_roles
from database.deps import get_db
from models.user import User
from models.student import Student
from models.application import Application
from models.enums import ApplicationStatus
from models.job import Job
from models.company import Company
from models.recruiter import Recruiter
from models.interview import Interview

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
def summary(
    db: Annotated[Session, Depends(get_db)],
    _admin=Depends(require_roles("admin")),
):
    total_students = db.query(func.count(Student.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_jobs = db.query(func.count(Job.id)).scalar() or 0
    total_apps = db.query(func.count(Application.id)).scalar() or 0
    offered = db.query(func.count(Application.id)).filter(Application.status == ApplicationStatus.offered).scalar() or 0

    placement_pct = int(round((offered / max(1, total_students)) * 100))

    dept = (
        db.query(Student.department.label("department"), func.count(Application.id).label("offers"))
        .join(Application, Application.student_id == Student.id)
        .filter(Application.status == ApplicationStatus.offered)
        .group_by(Student.department)
        .order_by(func.count(Application.id).desc())
        .all()
    )

    top_jobs = (
        db.query(Job.title.label("job"), func.count(Application.id).label("applications"))
        .join(Application, Application.job_id == Job.id)
        .group_by(Job.id)
        .order_by(func.count(Application.id).desc())
        .limit(5)
        .all()
    )

    status_rows = db.query(Application.status, func.count(Application.id)).group_by(Application.status).all()
    funnel = [
        {"status": status.value if hasattr(status, "value") else str(status), "count": count}
        for status, count in status_rows
    ]

    internship_apps = (
        db.query(func.count(Application.id))
        .join(Job, Application.job_id == Job.id)
        .filter(Job.is_internship == True)  # noqa: E712
        .scalar()
        or 0
    )
    internship_offers = (
        db.query(func.count(Application.id))
        .join(Job, Application.job_id == Job.id)
        .filter(Job.is_internship == True, Application.status == ApplicationStatus.offered)  # noqa: E712
        .scalar()
        or 0
    )
    internship_conversion_ratio = int(round((internship_offers / max(1, internship_apps)) * 100))

    top_recruiters = (
        db.query(Company.name.label("company"), func.count(Application.id).label("offers"))
        .join(Job, Job.company_id == Company.id)
        .join(Application, Application.job_id == Job.id)
        .filter(Application.status == ApplicationStatus.offered)
        .group_by(Company.id)
        .order_by(func.count(Application.id).desc())
        .limit(5)
        .all()
    )

    monthly_counter: dict[str, int] = defaultdict(int)
    for created_at, status in db.query(Application.created_at, Application.status).all():
        if created_at:
            key = created_at.strftime("%Y-%m")
            monthly_counter[key] += 1

    user_growth_counter: dict[str, int] = defaultdict(int)
    for (created_at,) in db.query(User.created_at).all():
        if created_at:
            key = created_at.strftime("%Y-%m")
            user_growth_counter[key] += 1

    return {
        "total_users": total_users,
        "total_students": total_students,
        "total_jobs": total_jobs,
        "total_applications": total_apps,
        "offers": offered,
        "placement_percentage": placement_pct,
        "internship_conversion_ratio": internship_conversion_ratio,
        "department_offers": [{"department": d.department, "offers": d.offers} for d in dept],
        "top_jobs": [{"job": j.job, "applications": j.applications} for j in top_jobs],
        "top_recruiters": [{"company": r.company, "offers": r.offers} for r in top_recruiters],
        "application_funnel": funnel,
        "monthly_hiring_trends": [{"month": k, "applications": monthly_counter[k]} for k in sorted(monthly_counter)],
        "user_growth": [{"month": k, "users": user_growth_counter[k]} for k in sorted(user_growth_counter)],
    }


@router.get("/recruiter/summary")
def recruiter_summary(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("recruiter"))],
):
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")

    company_ids = [c.id for c in db.query(Company.id).filter(Company.recruiter_id == recruiter.id).all()]
    job_ids = [j.id for j in db.query(Job.id).filter(Job.company_id.in_(company_ids)).all()] if company_ids else []

    if not job_ids:
        return {
            "companies": len(company_ids),
            "active_jobs": 0,
            "applications": 0,
            "shortlisted": 0,
            "interviews": 0,
            "offers": 0,
            "application_funnel": [],
        }

    apps = db.query(Application).filter(Application.job_id.in_(job_ids)).all()
    counts = Counter(a.status.value if hasattr(a.status, "value") else str(a.status) for a in apps)
    interview_count = (
        db.query(func.count(Interview.id))
        .join(Application, Interview.application_id == Application.id)
        .filter(Application.job_id.in_(job_ids))
        .scalar()
        or 0
    )

    statuses = ["applied", "shortlisted", "interview_scheduled", "offered", "rejected"]
    return {
        "companies": len(company_ids),
        "active_jobs": len(job_ids),
        "applications": len(apps),
        "shortlisted": counts.get("shortlisted", 0),
        "interviews": interview_count,
        "offers": counts.get("offered", 0),
        "application_funnel": [{"status": status, "count": counts.get(status, 0)} for status in statuses],
    }
