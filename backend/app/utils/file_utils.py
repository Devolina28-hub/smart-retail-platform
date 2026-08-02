"""
Small helpers for saving uploaded files to disk under a predictable path.
"""
import os
import uuid
from pathlib import Path

from fastapi import UploadFile


def save_upload(file: UploadFile, directory: str) -> str:
    """
    Saves an UploadFile under `directory`, returns the path relative to
    the backend root (safe to store in the DB and serve back later).
    """
    Path(directory).mkdir(parents=True, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    full_path = os.path.join(directory, filename)

    with open(full_path, "wb") as out:
        out.write(file.file.read())

    return full_path


def ensure_dirs(*paths: str) -> None:
    for p in paths:
        Path(p).mkdir(parents=True, exist_ok=True)
