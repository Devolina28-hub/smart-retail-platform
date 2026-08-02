"""
/face — register a customer's face and recognize incoming photos against
the stored customer base.
"""
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.deps import require_staff
from app.models.customer import Customer
from app.models.visit_log import VisitLog
from app.schemas.customer import CustomerOut, FaceRecognitionResult
from app.services import face_service
from app.utils.file_utils import save_upload

router = APIRouter(prefix="/face", tags=["Face Recognition"])


@router.post("/register", response_model=CustomerOut, status_code=201)
def register_face(
    name: str = Form(...),
    phone: str | None = Form(None),
    email: str | None = Form(None),
    gender: str | None = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    _staff=Depends(require_staff),
):
    saved_path = save_upload(image, settings.CUSTOMER_FACE_DIR)

    try:
        encoding = face_service.encode_face(saved_path)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    if encoding is None:
        raise HTTPException(status_code=422, detail="No face detected in the uploaded image")

    customer = Customer(
        name=name, phone=phone, email=email, gender=gender,
        face_encoding=encoding, face_image=saved_path,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.post("/recognize", response_model=FaceRecognitionResult)
def recognize_face(
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    _staff=Depends(require_staff),
):
    saved_path = save_upload(image, "data/tmp_recognize")

    try:
        probe_encoding = face_service.encode_face(saved_path)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    if probe_encoding is None:
        return FaceRecognitionResult(matched=False, confidence=0.0, message="No face detected in the image")

    customers = db.query(Customer).filter(Customer.face_encoding.isnot(None)).all()
    known = [(c.customer_id, c.face_encoding) for c in customers]

    matched_id, confidence = face_service.find_best_match(probe_encoding, known)

    if matched_id is None:
        return FaceRecognitionResult(
            matched=False, confidence=confidence, message="Unknown face — no matching customer found"
        )

    customer = db.query(Customer).filter(Customer.customer_id == matched_id).first()
    db.add(VisitLog(customer_id=matched_id, confidence=confidence))
    db.commit()

    return FaceRecognitionResult(
        matched=True,
        customer=CustomerOut.model_validate(customer),
        confidence=confidence,
        message=f"Welcome back, {customer.name}!",
    )
