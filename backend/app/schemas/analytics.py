from typing import List
from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_customers: int
    recognized_today: int
    total_products: int
    total_reviews: int
    positive_reviews: int
    negative_reviews: int
    neutral_reviews: int


class TimePoint(BaseModel):
    label: str
    value: float


class CategoryBreakdown(BaseModel):
    category: str
    count: int


class SystemStatus(BaseModel):
    database: str
    face_model: str
    product_model: str
    sentiment_model: str
