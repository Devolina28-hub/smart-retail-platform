"""
/sentiment — stateless "analyze this text" endpoint (no DB write).
Useful for a live-typing preview in the UI before the review is submitted.
"""
from fastapi import APIRouter
from pydantic import BaseModel

from app.schemas.review import SentimentResult
from app.services.sentiment_service import analyze_sentiment

router = APIRouter(prefix="/sentiment", tags=["Reviews"])


class TextIn(BaseModel):
    text: str


@router.post("", response_model=SentimentResult)
def analyze(payload: TextIn):
    return analyze_sentiment(payload.text)
