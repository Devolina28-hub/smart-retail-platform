from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    category: str
    price: float = Field(ge=0)
    stock: int = Field(ge=0, default=0)


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None


class ProductOut(BaseModel):
    product_id: int
    name: str
    category: str
    price: float
    stock: int
    image: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryPrediction(BaseModel):
    category: str
    confidence: float


class ClassificationResult(BaseModel):
    top_prediction: CategoryPrediction
    top_k: List[CategoryPrediction]
