from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CustomerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    phone: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None


class CustomerOut(BaseModel):
    customer_id: int
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None
    face_image: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class VisitLogOut(BaseModel):
    visit_id: int
    customer_id: int
    date: datetime
    confidence: float

    class Config:
        from_attributes = True


class FaceRecognitionResult(BaseModel):
    matched: bool
    customer: Optional[CustomerOut] = None
    confidence: float = 0.0
    message: str
