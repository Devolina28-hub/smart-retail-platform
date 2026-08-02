"""
Product image classification service.

Loads a fine-tuned MobileNetV2 Keras model (see backend/ml/train_product_classifier.py)
from MODEL_DIR/product_classifier.keras plus its class index mapping. If no
trained model is present yet (fresh clone, no dataset trained), falls back
to a clearly-labeled stub so the API stays usable during development.
"""
import json
import os
from typing import List

import numpy as np
from PIL import Image

from app.config import settings
from app.schemas.product import CategoryPrediction, ClassificationResult

MODEL_PATH = os.path.join(settings.MODEL_DIR, "product_classifier.keras")
LABELS_PATH = os.path.join(settings.MODEL_DIR, "product_labels.json")

_model = None
_labels: List[str] = []


def _load_model():
    global _model, _labels
    if _model is not None:
        return
    import tensorflow as tf  # imported lazily: TF is heavy and only needed here

    if os.path.exists(MODEL_PATH) and os.path.exists(LABELS_PATH):
        _model = tf.keras.models.load_model(MODEL_PATH)
        with open(LABELS_PATH) as f:
            _labels = json.load(f)
    else:
        _model = None
        _labels = []


def is_model_ready() -> bool:
    _load_model()
    return _model is not None


def classify_image(image_path: str, top_k: int = 3) -> ClassificationResult:
    _load_model()

    if _model is None:
        # No trained model yet -> explicit, honest stub instead of a fake confident answer.
        return ClassificationResult(
            top_prediction=CategoryPrediction(category="unknown", confidence=0.0),
            top_k=[CategoryPrediction(category="unknown", confidence=0.0)],
        )

    img = Image.open(image_path).convert("RGB").resize((224, 224))
    arr = np.array(img) / 255.0
    batch = np.expand_dims(arr, axis=0)

    preds = _model.predict(batch, verbose=0)[0]
    top_indices = preds.argsort()[-top_k:][::-1]

    top_k_predictions = [
        CategoryPrediction(category=_labels[i], confidence=round(float(preds[i]), 4))
        for i in top_indices
    ]

    return ClassificationResult(top_prediction=top_k_predictions[0], top_k=top_k_predictions)
