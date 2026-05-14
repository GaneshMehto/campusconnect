from datetime import datetime
from pydantic import BaseModel


class InterviewCreate(BaseModel):
    application_id: int
    scheduled_at: datetime
    mode: str = "online"
    meeting_link: str | None = None
    location: str | None = None
    notes: str | None = None


class InterviewUpdate(BaseModel):
    scheduled_at: datetime | None = None
    mode: str | None = None
    meeting_link: str | None = None
    location: str | None = None
    notes: str | None = None


class InterviewOut(BaseModel):
    id: int
    application_id: int
    scheduled_at: datetime
    mode: str
    meeting_link: str | None
    location: str | None = None
    notes: str | None
    created_at: datetime

    class Config:
        from_attributes = True
