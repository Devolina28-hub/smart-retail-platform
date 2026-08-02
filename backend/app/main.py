"""
Application entrypoint.

Run locally with:
    uvicorn app.main:app --reload

Or via Docker Compose (see repo root docker-compose.yml):
    docker compose up
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
from app.routers import (
    auth, customers, face, products, classify, reviews, sentiment, chat, analytics, admin,
)

# Import models package so every model is registered on Base.metadata before create_all.
import app.models  # noqa: F401

app = FastAPI(
    title="AI-Powered Smart Retail & Customer Intelligence Platform",
    description=(
        "Face-recognition customer intelligence, product image classification, "
        "review sentiment analysis, and an FAQ chatbot — one API for a modern retail dashboard."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded face/product images back to the frontend.
app.mount("/media", StaticFiles(directory=settings.UPLOAD_DIR), name="media")

app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(face.router)
app.include_router(products.router)
app.include_router(classify.router)
app.include_router(reviews.router)
app.include_router(sentiment.router)
app.include_router(chat.router)
app.include_router(analytics.router)
app.include_router(admin.router)


@app.on_event("startup")
def on_startup():
    # For a real production rollout, prefer Alembic migrations over create_all.
    # create_all is kept here so `docker compose up` works with zero manual steps.
    Base.metadata.create_all(bind=engine)


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "service": "AI-Powered Smart Retail & Customer Intelligence Platform API",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
