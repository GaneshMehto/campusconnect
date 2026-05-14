from pydantic import BaseModel, EmailStr, Field
from models.enums import UserRole


class SkillProfileOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class StudentProfileOut(BaseModel):
    id: int
    full_name: str
    department: str
    graduation_year: int
    cgpa: int | None = None
    resume_url: str | None = None
    skills: list[SkillProfileOut] = Field(default_factory=list)

    class Config:
        from_attributes = True


class RecruiterProfileOut(BaseModel):
    id: int
    full_name: str
    phone: str | None = None
    is_approved: bool

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: UserRole
    is_active: bool
    is_verified: bool
    student_profile: StudentProfileOut | None = None
    recruiter_profile: RecruiterProfileOut | None = None

    class Config:
        from_attributes = True


class UpdateStudentProfile(BaseModel):
    full_name: str | None = None
    department: str | None = None
    graduation_year: int | None = None
    cgpa: int | None = None


class UpdateRecruiterProfile(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    is_approved: bool | None = None
