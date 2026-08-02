"""
Face recognition service.

Wraps the `face_recognition` library (dlib-based). Encodings are 128-d
vectors stored directly on the Customer row (Postgres ARRAY(Float)).

Design notes:
- Registration: compute encoding from 1+ uploaded photos, average them,
  store the averaged encoding + the saved image path.
- Recognition: compute encoding of the incoming frame/photo, compare
  against every stored customer encoding using face distance, return the
  closest match if it is under FACE_MATCH_TOLERANCE.

This is O(n) per recognition call. For small-to-medium customer bases
(a few thousand) this is fine; the FAISS vector index (see
`vector_index.py`-style usage in classify service) is the pattern to
reach for if this ever needs to scale further.
"""
from typing import List, Optional, Tuple

import numpy as np

try:
    import face_recognition
except ImportError:  # pragma: no cover - library is heavy; guarded for docs/dev without it installed
    face_recognition = None

from app.config import settings


def _require_face_recognition():
    if face_recognition is None:
        raise RuntimeError(
            "face_recognition is not installed. Install it (see backend/requirements.txt) "
            "to enable face registration/recognition."
        )


def encode_face(image_path: str) -> Optional[List[float]]:
    """Returns a 128-d encoding for the first detected face in the image, or None."""
    _require_face_recognition()
    image = face_recognition.load_image_file(image_path)
    locations = face_recognition.face_locations(image, model="hog")
    if not locations:
        return None
    encodings = face_recognition.face_encodings(image, known_face_locations=locations)
    if not encodings:
        return None
    return encodings[0].tolist()


def average_encodings(encodings: List[List[float]]) -> List[float]:
    return np.mean(np.array(encodings), axis=0).tolist()


def find_best_match(
    probe_encoding: List[float],
    known: List[Tuple[int, List[float]]],
) -> Tuple[Optional[int], float]:
    """
    known: list of (customer_id, encoding)
    Returns (customer_id or None, confidence 0..1). Confidence is derived
    from face distance: confidence = max(0, 1 - distance).
    """
    _require_face_recognition()
    if not known:
        return None, 0.0

    probe = np.array(probe_encoding)
    ids = [k[0] for k in known]
    vectors = np.array([k[1] for k in known])

    distances = np.linalg.norm(vectors - probe, axis=1)
    best_idx = int(np.argmin(distances))
    best_distance = float(distances[best_idx])
    confidence = max(0.0, 1.0 - best_distance)

    if best_distance <= settings.FACE_MATCH_TOLERANCE:
        return ids[best_idx], round(confidence, 4)
    return None, round(confidence, 4)
