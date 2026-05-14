from datetime import datetime
from pydantic import BaseModel


class CompanyCreate(BaseModel):
    name: str
    website: str | None = None
    description: str | None = None


class CompanyUpdate(BaseModel):
    name: str | None = None
    website: str | None = None
    description: str | None = None


class CompanyOut(BaseModel):
    id: int
    recruiter_id: int
    name: str
    website: str | None
    description: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
