from sqlalchemy import Column, Integer, ForeignKey, DateTime, Float, func
from sqlalchemy.orm import relationship
from app.database import Base


class VisitLog(Base):
    __tablename__ = "visit_logs"

    visit_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())
    confidence = Column(Float, nullable=False)

    customer = relationship("Customer", back_populates="visits")
