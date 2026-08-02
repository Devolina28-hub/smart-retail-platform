"""
/analytics — dashboard summary numbers, charts, and top products.
"""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_staff
from app.models.customer import Customer
from app.models.visit_log import VisitLog
from app.models.product import Product
from app.models.review import Review
from app.schemas.analytics import DashboardSummary, TimePoint, CategoryBreakdown

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=DashboardSummary)
def summary(db: Session = Depends(get_db), _staff=Depends(require_staff)):
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    total_customers = db.query(func.count(Customer.customer_id)).scalar() or 0
    recognized_today = (
        db.query(func.count(func.distinct(VisitLog.customer_id)))
        .filter(VisitLog.date >= today_start)
        .scalar() or 0
    )
    total_products = db.query(func.count(Product.product_id)).scalar() or 0
    total_reviews = db.query(func.count(Review.review_id)).scalar() or 0
    positive = db.query(func.count(Review.review_id)).filter(Review.sentiment == "positive").scalar() or 0
    negative = db.query(func.count(Review.review_id)).filter(Review.sentiment == "negative").scalar() or 0
    neutral = db.query(func.count(Review.review_id)).filter(Review.sentiment == "neutral").scalar() or 0

    return DashboardSummary(
        total_customers=total_customers,
        recognized_today=recognized_today,
        total_products=total_products,
        total_reviews=total_reviews,
        positive_reviews=positive,
        negative_reviews=negative,
        neutral_reviews=neutral,
    )


@router.get("/visits-timeline", response_model=list[TimePoint])
def visits_timeline(db: Session = Depends(get_db), days: int = 7, _staff=Depends(require_staff)):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    rows = (
        db.query(func.date(VisitLog.date).label("day"), func.count(VisitLog.visit_id))
        .filter(VisitLog.date >= since)
        .group_by("day")
        .order_by("day")
        .all()
    )
    return [TimePoint(label=str(day), value=count) for day, count in rows]


@router.get("/review-breakdown", response_model=list[TimePoint])
def review_breakdown(db: Session = Depends(get_db), _staff=Depends(require_staff)):
    rows = (
        db.query(Review.sentiment, func.count(Review.review_id))
        .group_by(Review.sentiment)
        .all()
    )
    return [TimePoint(label=sentiment or "unclassified", value=count) for sentiment, count in rows]


@router.get("/top-categories", response_model=list[CategoryBreakdown])
def top_categories(db: Session = Depends(get_db), _staff=Depends(require_staff)):
    rows = (
        db.query(Product.category, func.count(Product.product_id))
        .group_by(Product.category)
        .order_by(func.count(Product.product_id).desc())
        .limit(10)
        .all()
    )
    return [CategoryBreakdown(category=cat, count=count) for cat, count in rows]
