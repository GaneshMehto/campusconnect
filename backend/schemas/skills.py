from pydantic import BaseModel


class SkillOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class AddStudentSkills(BaseModel):
    skill_names: list[str]
