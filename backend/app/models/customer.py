from sqlalchemy import Column, Integer, String, DateTime, func, ARRAY, Float
from sqlalchemy.orm import relationship
from app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(180), nullable=True)
    gender = Column(String(20), nullable=True)
    face_encoding = Column(ARRAY(Float), nullable=True)  # 128-d face_recognition vector
    face_image = Column(String(255), nullable=True)  # relative path under data/customers
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    visits = relationship("VisitLog", back_populates="customer", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="customer")
