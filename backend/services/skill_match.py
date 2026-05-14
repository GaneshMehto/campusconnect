import re


def normalize_tokens(text: str) -> set[str]:
    tokens = re.findall(r"[a-zA-Z0-9\+\#\.]{2,}", text.lower())
    return set(tokens)


def compute_match_score(student_skills: list[str], job_requirements: str | None) -> int:
    if not job_requirements:
        return 0

    job_tokens = normalize_tokens(job_requirements)
    if not job_tokens:
        return 0

    student_tokens = set([s.strip().lower() for s in student_skills if s.strip()])
    if not student_tokens:
        return 0

    hits = len(job_tokens.intersection(student_tokens))
    score = int(round((hits / max(1, len(job_tokens))) * 100))
    return max(0, min(100, score))
