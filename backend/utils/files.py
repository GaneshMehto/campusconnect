import os
from pathlib import Path
from uuid import uuid4
from fastapi import UploadFile, HTTPException

ALLOWED = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def ensure_dir(path: str) -> None:
    Path(path).mkdir(parents=True, exist_ok=True)


def validate_upload(upload: UploadFile, max_mb: int) -> None:
    if upload.content_type not in ALLOWED:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    max_bytes = max_mb * 1024 * 1024
    upload.file.seek(0, os.SEEK_END)
    size = upload.file.tell()
    upload.file.seek(0)
    if size > max_bytes:
        raise HTTPException(status_code=400, detail=f"File too large. Maximum size is {max_mb}MB")


def safe_filename(name: str) -> str:
    return "".join(c for c in name if c.isalnum() or c in ("-", "_", "."))[:200]


def save_upload(upload_dir: str, upload: UploadFile, prefix: str) -> str:
    ensure_dir(upload_dir)
    fname = safe_filename(upload.filename or "resume")
    path = os.path.join(upload_dir, f"{prefix}_{uuid4().hex}_{fname}")
    with open(path, "wb") as f:
        f.write(upload.file.read())
    return path
