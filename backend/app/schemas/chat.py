from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)


class ChatResponse(BaseModel):
    answer: str
    intent: str
    confidence: float


class ChatHistoryOut(BaseModel):
    chat_id: int
    user_id: Optional[int]
    question: str
    answer: str
    intent: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True
