from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from app.database import Base


class ChatHistory(Base):
    __tablename__ = "chat_history"

    chat_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    intent = Column(String(80), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
