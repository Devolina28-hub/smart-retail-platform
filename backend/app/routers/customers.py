"""
/customers — CRUD, search, pagination, filter, CSV export, visit logs.
"""
import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_staff
from app.models.customer import Customer
from app.models.visit_log import VisitLog
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerOut, VisitLogOut

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("", response_model=list[CustomerOut])
def list_customers(
    db: Session = Depends(get_db),
    search: str | None = Query(None, description="Search by name, email, or phone"),
    gender: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    _staff=Depends(require_staff),
):
    query = db.query(Customer)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(Customer.name.ilike(like), Customer.email.ilike(like), Customer.phone.ilike(like)))
    if gender:
        query = query.filter(Customer.gender == gender)

    query = query.order_by(Customer.created_at.desc())
    offset = (page - 1) * page_size
    return query.offset(offset).limit(page_size).all()


@router.post("", response_model=CustomerOut, status_code=201)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db), _staff=Depends(require_staff)):
    customer = Customer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/export.csv")
def export_customers_csv(db: Session = Depends(get_db), _staff=Depends(require_staff)):
    customers = db.query(Customer).order_by(Customer.created_at.desc()).all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["customer_id", "name", "phone", "email", "gender", "created_at"])
    for c in customers:
        writer.writerow([c.customer_id, c.name, c.phone, c.email, c.gender, c.created_at])
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=customers.csv"},
    )


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db), _staff=Depends(require_staff)):
    customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(
    customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db), _staff=Depends(require_staff)
):
    customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: int, db: Session = Depends(get_db), _staff=Depends(require_staff)):
    customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(customer)
    db.commit()


@router.get("/{customer_id}/visits", response_model=list[VisitLogOut])
def get_customer_visits(customer_id: int, db: Session = Depends(get_db), _staff=Depends(require_staff)):
    return (
        db.query(VisitLog)
        .filter(VisitLog.customer_id == customer_id)
        .order_by(VisitLog.date.desc())
        .all()
    )
