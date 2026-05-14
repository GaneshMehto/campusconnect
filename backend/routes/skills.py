from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.deps import require_roles
from database.deps import get_db
from models.skill import Skill
from models.student import Student
from models.user import User
from schemas.skills import SkillOut, AddStudentSkills

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("/all", response_model=list[SkillOut])
def list_skills(db: Annotated[Session, Depends(get_db)]):
    return db.query(Skill).order_by(Skill.name.asc()).all()


@router.get("/me", response_model=list[SkillOut])
def my_skills(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("student"))],
):
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return sorted(student.skills, key=lambda s: s.name.lower())


@router.post("/me", response_model=list[SkillOut])
def add_my_skills(
    payload: AddStudentSkills,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("student"))],
):
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    names = [n.strip() for n in payload.skill_names if n.strip()]
    if not names:
        return []

    existing = db.query(Skill).filter(Skill.name.in_(names)).all()
    existing_map = {s.name: s for s in existing}

    final = []
    for name in names:
        s = existing_map.get(name)
        if not s:
            s = Skill(name=name)
            db.add(s)
            db.flush()
        final.append(s)

    merged = {s.id: s for s in student.skills}
    merged.update({s.id: s for s in final})
    student.skills = list(merged.values())
    db.commit()
    return student.skills


@router.delete("/me/{skill_id}")
def remove_my_skill(
    skill_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_roles("student"))],
):
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    student.skills = [s for s in student.skills if s.id != skill_id]
    db.commit()
    return {"ok": True}
