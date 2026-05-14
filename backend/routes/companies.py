from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.deps import require_roles
from database.deps import get_db
from models.company import Company
from models.recruiter import Recruiter
from models.user import User
from schemas.companies import CompanyCreate, CompanyOut, CompanyUpdate

router = APIRouter(prefix="/companies", tags=["companies"])


@router.post("/", response_model=CompanyOut, status_code=201)
def create_company(
    payload: CompanyCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("recruiter"))],
):
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")

    company = Company(recruiter_id=recruiter.id, **payload.model_dump())
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@router.get("/me", response_model=list[CompanyOut])
def my_companies(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("recruiter"))],
):
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")

    return db.query(Company).filter(Company.recruiter_id == recruiter.id).order_by(Company.created_at.desc()).all()


@router.put("/{company_id}", response_model=CompanyOut)
def update_company(
    company_id: int,
    payload: CompanyUpdate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("recruiter"))],
):
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")

    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    if company.recruiter_id != recruiter.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(company, k, v)

    db.commit()
    db.refresh(company)
    return company
