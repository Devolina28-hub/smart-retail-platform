"""
Bulk-registers customer faces from a local folder structure directly into
Postgres, without going through the API one photo at a time.

Expected layout:

    backend/data/customers/
        Rahul/
            1.jpg
            2.jpg
        Priya/
            1.jpg

Usage:
    python -m ml.train_face_encodings
    (run from backend/, with the FastAPI app's venv active and DATABASE_URL set)

For each customer folder, every photo is encoded with face_recognition and
the resulting 128-d vectors are averaged into one stored encoding — using
multiple angles/lighting conditions per person meaningfully improves
recognition accuracy over a single photo.
"""
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.database import SessionLocal, Base, engine
from app.models.customer import Customer
from app.services.face_service import encode_face, average_encodings

CUSTOMERS_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "customers")


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if not os.path.isdir(CUSTOMERS_DIR):
        print(f"No customer data found at {CUSTOMERS_DIR}. Create one folder per customer with their photos.")
        return

    for person_name in sorted(os.listdir(CUSTOMERS_DIR)):
        person_dir = os.path.join(CUSTOMERS_DIR, person_name)
        if not os.path.isdir(person_dir):
            continue

        encodings = []
        first_image_path = None
        for filename in sorted(os.listdir(person_dir)):
            if not filename.lower().endswith((".jpg", ".jpeg", ".png")):
                continue
            image_path = os.path.join(person_dir, filename)
            encoding = encode_face(image_path)
            if encoding is not None:
                encodings.append(encoding)
                first_image_path = first_image_path or image_path

        if not encodings:
            print(f"[skip] {person_name}: no usable face found in any photo")
            continue

        averaged = average_encodings(encodings)

        existing = db.query(Customer).filter(Customer.name == person_name).first()
        if existing:
            existing.face_encoding = averaged
            existing.face_image = first_image_path
            print(f"[update] {person_name}: re-encoded from {len(encodings)} photo(s)")
        else:
            db.add(Customer(name=person_name, face_encoding=averaged, face_image=first_image_path))
            print(f"[new] {person_name}: encoded from {len(encodings)} photo(s)")

    db.commit()
    db.close()
    print("Done.")


if __name__ == "__main__":
    main()
