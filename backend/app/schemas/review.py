from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    review: str = Field(min_length=1)
    customer_id: Optional[int] = None
    product_id: Optional[int] = None


class ReviewOut(BaseModel):
    review_id: int
    customer_id: Optional[int]
    product_id: Optional[int]
    review: str
    sentiment: Optional[str]
    confidence: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


class SentimentResult(BaseModel):
    sentiment: str  # positive | negative | neutral
    confidence: float
    scores: dict


class BulkSentimentSummary(BaseModel):
    total: int
    positive: int
    negative: int
    neutral: int
    results: List[ReviewOut]
