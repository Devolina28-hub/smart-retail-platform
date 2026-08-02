"""
/classify — upload a product photo, get back predicted category + confidence.
"""
from fastapi import APIRouter, Depends, File, UploadFile

from app.deps import require_staff
from app.schemas.product import ClassificationResult
from app.services import product_classifier_service
from app.utils.file_utils import save_upload

router = APIRouter(prefix="/classify", tags=["Product Recognition"])


@router.post("", response_model=ClassificationResult)
def classify_product_image(image: UploadFile = File(...), _staff=Depends(require_staff)):
    saved_path = save_upload(image, "data/tmp_classify")
    return product_classifier_service.classify_image(saved_path)


@router.get("/status")
def classifier_status():
    return {"model_ready": product_classifier_service.is_model_ready()}
