"""
Seeds the database with sample data so the dashboard has something to show
on first run: an admin user, a handful of customers, products, reviews,
and visit logs. No face encodings are seeded here (real encodings need
real photos) — use ml/train_face_encodings.py for that once you've added
photos under data/customers/.

Usage (from backend/):
    python -m scripts.seed
"""
import os
import random
import sys
from datetime import datetime, timedelta, timezone

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.customer import Customer
from app.models.product import Product
from app.models.review import Review
from app.models.visit_log import VisitLog
from app.security import hash_password

SAMPLE_CUSTOMERS = [
    ("Rahul Sharma", "9876500001", "rahul@example.com", "male"),
    ("Priya Verma", "9876500002", "priya@example.com", "female"),
    ("Aditya Rao", "9876500003", "aditya@example.com", "male"),
    ("Sneha Patel", "9876500004", "sneha@example.com", "female"),
    ("Karan Mehta", "9876500005", "karan@example.com", "male"),
]

SAMPLE_PRODUCTS = [
    ("Classic Running Shoes", "Shoes", 59.99, 120),
    ("Everyday Crew T-Shirt", "Tshirts", 14.99, 300),
    ("SmartX Phone 12", "Phones", 399.00, 45),
    ("The Design of Everyday Things", "Books", 22.50, 80),
    ("Canvas Weekender Bag", "Bags", 44.00, 60),
]

SAMPLE_REVIEWS = [
    ("Absolutely love these shoes, super comfortable for daily runs.", "positive"),
    ("The t-shirt shrank after one wash, pretty disappointed.", "negative"),
    ("Phone works fine, nothing special but does the job.", "neutral"),
    ("Great read, well written and genuinely useful.", "positive"),
    ("Bag strap tore within a week. Would not recommend.", "negative"),
]


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if not db.query(User).filter(User.email == "admin@smartretail.dev").first():
        db.add(User(
            name="Platform Admin",
            email="admin@smartretail.dev",
            password=hash_password("Admin@123"),
            role="admin",
        ))
        print("Seeded admin user -> admin@smartretail.dev / Admin@123")

    customers = []
    for name, phone, email, gender in SAMPLE_CUSTOMERS:
        existing = db.query(Customer).filter(Customer.email == email).first()
        if existing:
            customers.append(existing)
            continue
        c = Customer(name=name, phone=phone, email=email, gender=gender)
        db.add(c)
        db.flush()
        customers.append(c)
    print(f"Seeded {len(customers)} customers")

    products = []
    for name, category, price, stock in SAMPLE_PRODUCTS:
        existing = db.query(Product).filter(Product.name == name).first()
        if existing:
            products.append(existing)
            continue
        p = Product(name=name, category=category, price=price, stock=stock)
        db.add(p)
        db.flush()
        products.append(p)
    print(f"Seeded {len(products)} products")

    for i, (text, sentiment) in enumerate(SAMPLE_REVIEWS):
        db.add(Review(
            customer_id=customers[i % len(customers)].customer_id,
            product_id=products[i % len(products)].product_id,
            review=text,
            sentiment=sentiment,
            confidence=round(random.uniform(0.7, 0.97), 2),
        ))
    print(f"Seeded {len(SAMPLE_REVIEWS)} reviews")

    now = datetime.now(timezone.utc)
    for i, c in enumerate(customers):
        for d in range(3):
            db.add(VisitLog(
                customer_id=c.customer_id,
                date=now - timedelta(days=d, hours=i),
                confidence=round(random.uniform(0.75, 0.99), 2),
            ))
    print("Seeded sample visit logs")

    db.commit()
    db.close()
    print("Done.")


if __name__ == "__main__":
    main()
