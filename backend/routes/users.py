from typing import Annotated
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from auth.deps import get_current_user, require_roles
from config.settings import settings
from database.deps import get_db
from models.user import User
from models.student import Student
from models.recruiter import Recruiter
from schemas.users import UserOut, UpdateStudentProfile, UpdateRecruiterProfile
from utils.files import validate_upload, save_upload

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def me(user: Annotated[User, Depends(get_current_user)]):
    return user


@router.put("/me/student")
def update_student(
    payload: UpdateStudentProfile,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("student"))],
):
    profile = db.query(Student).filter(Student.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(profile, k, v)

    db.commit()
    return {"ok": True}


@router.put("/me/recruiter")
def update_recruiter(
    payload: UpdateRecruiterProfile,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("recruiter", "admin"))],
):
    profile = db.query(Recruiter).filter(Recruiter.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(profile, k, v)

    db.commit()
    return {"ok": True}


@router.post("/me/resume")
def upload_resume(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("student"))],
    file: UploadFile = File(...),
):
    validate_upload(file, settings.MAX_UPLOAD_MB)
    path = save_upload(settings.UPLOAD_DIR, file, prefix=f"u{user.id}")
    profile = db.query(Student).filter(Student.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    profile.resume_url = path
    db.commit()
    return {"resume_url": path}


@router.get("/me/resume")
def download_resume(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("student"))],
):
    profile = db.query(Student).filter(Student.user_id == user.id).first()
    if not profile or not profile.resume_url:
        raise HTTPException(status_code=404, detail="Resume not found")

    base_dir = Path(settings.UPLOAD_DIR).resolve()
    resume_path = Path(profile.resume_url).resolve()
    if base_dir not in resume_path.parents or not resume_path.is_file():
        raise HTTPException(status_code=404, detail="Resume not found")

    download_name = resume_path.name.split("_", 2)[-1]
    return FileResponse(resume_path, filename=download_name)
