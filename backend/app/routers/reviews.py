"""
/reviews — store customer reviews (with sentiment attached at creation time).
"""
import csv
import io

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewOut, BulkSentimentSummary
from app.services.sentiment_service import analyze_sentiment

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("", response_model=list[ReviewOut])
def list_reviews(
    db: Session = Depends(get_db),
    sentiment: str | None = None,
    product_id: int | None = None,
    _user: User = Depends(get_current_user),
):
    query = db.query(Review)
    if sentiment:
        query = query.filter(Review.sentiment == sentiment)
    if product_id:
        query = query.filter(Review.product_id == product_id)
    return query.order_by(Review.created_at.desc()).all()


@router.post("", response_model=ReviewOut, status_code=201)
def create_review(payload: ReviewCreate, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    result = analyze_sentiment(payload.review)
    review = Review(
        review=payload.review,
        customer_id=payload.customer_id,
        product_id=payload.product_id,
        sentiment=result.sentiment,
        confidence=result.confidence,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.post("/upload-csv", response_model=BulkSentimentSummary)
def upload_reviews_csv(file: UploadFile = File(...), db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    """
    Expects CSV columns: customer_id, product_id, review, rating (rating is optional/ignored for sentiment).
    """
    content = file.file.read().decode("utf-8", errors="ignore")
    reader = csv.DictReader(io.StringIO(content))

    if "review" not in (reader.fieldnames or []):
        raise HTTPException(status_code=422, detail="CSV must include a 'review' column")

    created: list[Review] = []
    counts = {"positive": 0, "negative": 0, "neutral": 0}

    for row in reader:
        text = (row.get("review") or "").strip()
        if not text:
            continue
        result = analyze_sentiment(text)
        review = Review(
            review=text,
            customer_id=int(row["customer_id"]) if row.get("customer_id") else None,
            product_id=int(row["product_id"]) if row.get("product_id") else None,
            sentiment=result.sentiment,
            confidence=result.confidence,
        )
        db.add(review)
        created.append(review)
        counts[result.sentiment] = counts.get(result.sentiment, 0) + 1

    db.commit()
    for r in created:
        db.refresh(r)

    return BulkSentimentSummary(
        total=len(created),
        positive=counts.get("positive", 0),
        negative=counts.get("negative", 0),
        neutral=counts.get("neutral", 0),
        results=created,
    )
