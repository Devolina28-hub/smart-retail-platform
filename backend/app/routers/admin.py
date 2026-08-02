"""
/admin — user management, permissions, system status (model/db/api health).
Everything here requires the `admin` role.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_admin
from app.models.user import User
from app.schemas.analytics import SystemStatus
from app.schemas.user import UserOut
from app.services import product_classifier_service, sentiment_service

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _admin=Depends(require_admin)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.put("/users/{user_id}/role", response_model=UserOut)
def change_role(user_id: int, role: str, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    if role not in ("admin", "employee", "customer"):
        raise HTTPException(status_code=422, detail="Invalid role")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = role
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()


@router.get("/status", response_model=SystemStatus)
def system_status(db: Session = Depends(get_db), _admin=Depends(require_admin)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "unreachable"

    return SystemStatus(
        database=db_status,
        face_model="ready (face_recognition/dlib, no training file needed)",
        product_model="ready" if product_classifier_service.is_model_ready() else "not trained yet",
        sentiment_model="ready" if sentiment_service.is_model_ready() else "using heuristic fallback",
    )
