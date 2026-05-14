from datetime import datetime
from pydantic import BaseModel
from models.enums import ApplicationStatus


class ApplyRequest(BaseModel):
    job_id: int


class ApplicationOut(BaseModel):
    id: int
    student_id: int
    job_id: int
    status: ApplicationStatus
    match_score: int | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UpdateApplicationStatus(BaseModel):
    status: ApplicationStatus
