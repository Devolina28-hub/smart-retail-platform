"""
FAQ chatbot service.

Two-stage strategy:
1. Rule-based: exact/substring match against intents.json patterns (fast, predictable).
2. ML fallback: TF-IDF + cosine similarity across all patterns when no rule
   matches confidently — catches paraphrases without needing a heavy LLM.

If nothing clears CHATBOT_MIN_CONFIDENCE, we return a fallback response
rather than a guess.
"""
import json
import os
from typing import List, Tuple

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.config import settings
from app.schemas.chat import ChatResponse

INTENTS_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "intents.json")

_intents = []
_pattern_texts: List[str] = []
_pattern_tags: List[str] = []
_vectorizer: TfidfVectorizer | None = None
_pattern_matrix = None

FALLBACK_RESPONSE = (
    "I'm not fully sure about that one — could you rephrase, or ask about "
    "shipping, returns, payments, warranty, offers, or store hours?"
)


def _load_intents():
    global _intents, _pattern_texts, _pattern_tags, _vectorizer, _pattern_matrix
    if _intents:
        return

    with open(INTENTS_PATH) as f:
        data = json.load(f)
    _intents = data["intents"]

    for intent in _intents:
        for pattern in intent["patterns"]:
            _pattern_texts.append(pattern.lower())
            _pattern_tags.append(intent["tag"])

    _vectorizer = TfidfVectorizer()
    _pattern_matrix = _vectorizer.fit_transform(_pattern_texts)


def _rule_based_match(message: str) -> Tuple[str, float] | None:
    lowered = message.lower().strip()
    for intent in _intents:
        for pattern in intent["patterns"]:
            if pattern in lowered or lowered in pattern:
                return intent["tag"], 0.95
    return None


def _ml_fallback_match(message: str) -> Tuple[str, float]:
    probe = _vectorizer.transform([message.lower()])
    similarities = cosine_similarity(probe, _pattern_matrix)[0]
    best_idx = int(similarities.argmax())
    return _pattern_tags[best_idx], float(similarities[best_idx])


def _response_for_tag(tag: str) -> str:
    for intent in _intents:
        if intent["tag"] == tag:
            # Rotate through responses deterministically (first one) — keeps API responses stable/testable.
            return intent["responses"][0]
    return FALLBACK_RESPONSE


def get_chat_response(message: str) -> ChatResponse:
    _load_intents()

    rule_match = _rule_based_match(message)
    if rule_match:
        tag, confidence = rule_match
        return ChatResponse(answer=_response_for_tag(tag), intent=tag, confidence=confidence)

    tag, confidence = _ml_fallback_match(message)
    if confidence >= settings.CHATBOT_MIN_CONFIDENCE:
        return ChatResponse(answer=_response_for_tag(tag), intent=tag, confidence=round(confidence, 4))

    return ChatResponse(answer=FALLBACK_RESPONSE, intent="fallback", confidence=round(confidence, 4))
