"""
/chat — FAQ chatbot endpoint + conversation history.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.chat_history import ChatHistory
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse, ChatHistoryOut
from app.services.chatbot_service import get_chat_response

router = APIRouter(prefix="/chat", tags=["Chatbot"])


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    response = get_chat_response(payload.message)

    db.add(ChatHistory(
        user_id=current_user.id,
        question=payload.message,
        answer=response.answer,
        intent=response.intent,
    ))
    db.commit()

    return response


@router.get("/history", response_model=list[ChatHistoryOut])
def chat_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.timestamp.desc())
        .limit(100)
        .all()
    )
