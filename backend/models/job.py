from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Text, Integer, Boolean, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), index=True)

    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str | None] = mapped_column(String(128), nullable=True)

    is_internship: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    stipend: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_lpa: Mapped[int | None] = mapped_column(Integer, nullable=True)

    requirements: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    company = relationship("Company", back_populates="jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan", passive_deletes=True)


Index("ix_jobs_company_created", Job.company_id, Job.created_at)
