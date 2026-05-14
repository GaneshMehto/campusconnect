from datetime import datetime
from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    company_id: int
    title: str
    description: str
    location: str | None = None
    is_internship: bool = True
    stipend: int | None = None
    salary_lpa: int | None = None
    requirements: str | None = None


class JobUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    is_internship: bool | None = None
    stipend: int | None = None
    salary_lpa: int | None = None
    requirements: str | None = None


class JobOut(BaseModel):
    id: int
    company_id: int
    title: str
    description: str
    location: str | None
    is_internship: bool
    stipend: int | None
    salary_lpa: int | None
    requirements: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class JobListQuery(BaseModel):
    q: str | None = None
    is_internship: bool | None = None
    company_id: int | None = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=50)


class RecruiterJobListQuery(BaseModel):
    company_id: int | None = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=50)
