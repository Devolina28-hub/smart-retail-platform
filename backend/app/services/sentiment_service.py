"""
Review sentiment analysis service.

Loads a TF-IDF vectorizer + Logistic Regression classifier trained by
backend/ml/train_sentiment_model.py (sentiment.pkl + vectorizer.pkl).
Falls back to a small lexicon-based heuristic if no trained model is
present yet, so /reviews/sentiment stays usable out of the box before
you've trained on real review data.
"""
import os
import re
from typing import Dict

import joblib

from app.config import settings
from app.schemas.review import SentimentResult

VECTORIZER_PATH = os.path.join(settings.MODEL_DIR, "vectorizer.pkl")
MODEL_PATH = os.path.join(settings.MODEL_DIR, "sentiment.pkl")

_vectorizer = None
_model = None

_POSITIVE_WORDS = {
    "good", "great", "excellent", "love", "amazing", "perfect", "happy",
    "best", "awesome", "recommend", "comfortable", "beautiful", "fast",
}
_NEGATIVE_WORDS = {
    "bad", "worst", "terrible", "hate", "poor", "disappointed", "awful",
    "broken", "slow", "waste", "cheap", "return", "refund", "defective",
}


def _load_model():
    global _vectorizer, _model
    if _model is not None:
        return
    if os.path.exists(VECTORIZER_PATH) and os.path.exists(MODEL_PATH):
        _vectorizer = joblib.load(VECTORIZER_PATH)
        _model = joblib.load(MODEL_PATH)


def is_model_ready() -> bool:
    _load_model()
    return _model is not None


def _heuristic_sentiment(text: str) -> SentimentResult:
    tokens = set(re.findall(r"[a-z']+", text.lower()))
    pos_hits = len(tokens & _POSITIVE_WORDS)
    neg_hits = len(tokens & _NEGATIVE_WORDS)

    if pos_hits == 0 and neg_hits == 0:
        return SentimentResult(
            sentiment="neutral", confidence=0.5,
            scores={"positive": 0.33, "negative": 0.33, "neutral": 0.34},
        )

    total = pos_hits + neg_hits
    pos_score = pos_hits / total
    neg_score = neg_hits / total

    if pos_score > neg_score:
        return SentimentResult(
            sentiment="positive", confidence=round(0.5 + pos_score / 2, 4),
            scores={"positive": round(pos_score, 4), "negative": round(neg_score, 4), "neutral": 0.0},
        )
    if neg_score > pos_score:
        return SentimentResult(
            sentiment="negative", confidence=round(0.5 + neg_score / 2, 4),
            scores={"positive": round(pos_score, 4), "negative": round(neg_score, 4), "neutral": 0.0},
        )
    return SentimentResult(
        sentiment="neutral", confidence=0.5,
        scores={"positive": round(pos_score, 4), "negative": round(neg_score, 4), "neutral": 0.0},
    )


def analyze_sentiment(text: str) -> SentimentResult:
    _load_model()

    if _model is None or _vectorizer is None:
        return _heuristic_sentiment(text)

    vector = _vectorizer.transform([text])
    proba = _model.predict_proba(vector)[0]
    classes = list(_model.classes_)
    scores: Dict[str, float] = {cls: round(float(p), 4) for cls, p in zip(classes, proba)}

    best_idx = int(proba.argmax())
    sentiment = classes[best_idx]
    confidence = round(float(proba[best_idx]), 4)

    return SentimentResult(sentiment=sentiment, confidence=confidence, scores=scores)
