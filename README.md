# AI-Powered Smart Retail & Customer Intelligence Platform

A full-stack, free-stack-only retail intelligence platform: face-recognition customer
check-in, product image classification, review sentiment analysis, and an FAQ chatbot,
all wired into one dashboard.

- **Frontend:** React (Vite) + TypeScript + Tailwind + Framer Motion + Recharts
- **Backend:** FastAPI + SQLAlchemy + JWT auth
- **ML:** face_recognition (dlib), MobileNetV2 (Keras transfer learning), TF-IDF + Logistic Regression, rule-based/TF-IDF chatbot
- **Database:** PostgreSQL
- **Deployment:** Docker Compose, GitHub Actions CI

No paid APIs, no paid datasets, no paid hosting required.

---

## 1. Quick start (Docker — recommended)

```bash
git clone <this-repo>
cd smart-retail-platform

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# edit backend/.env — at minimum change JWT_SECRET_KEY and POSTGRES_PASSWORD

docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs (Swagger): http://localhost:8000/docs

Seed the database with demo data (run once, after containers are up):

```bash
docker compose exec backend python -m scripts.seed
```

This creates an admin login: **admin@smartretail.dev / Admin@123**

---

## 2. Local development (without Docker)

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # point DATABASE_URL at a local Postgres instance
uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

You'll need a local PostgreSQL instance running (or use `docker compose up db` to
run just the database container while developing the app natively).

---

## 3. Adding real data & training the ML models

The app runs immediately with sensible fallbacks (heuristic sentiment, "unknown"
product classification, face recognition works out of the box since it needs no
training — just registered faces). To get real accuracy, feed it data:

### Faces
```
backend/data/customers/
    Rahul/
        1.jpg
        2.jpg
    Priya/
        1.jpg
```
Then run:
```bash
cd backend
python -m ml.train_face_encodings
```
This encodes every photo and upserts each customer directly into Postgres — no
retraining is ever required for new faces; you can also just use the
`/face/register` API endpoint from the UI for one customer at a time.

### Products
Download a free dataset such as [Fashion Product Images (Small)](https://www.kaggle.com/datasets/paramaggarwal/fashion-product-images-small)
or [Fruits360](https://www.kaggle.com/datasets/moltean/fruits), sort images into
category folders:
```
backend/data/products/
    Shoes/
    Tshirts/
    Phones/
    Books/
    Bags/
```
Then run:
```bash
cd backend
python -m ml.train_product_classifier --epochs 10
```
This fine-tunes MobileNetV2 (frozen ImageNet backbone) and saves
`models_store/product_classifier.keras` + `models_store/product_labels.json`.
Restart the backend afterward to pick up the new model.

### Review sentiment
Download [Women's E-Commerce Clothing Reviews](https://www.kaggle.com/datasets/nicapotato/womens-ecommerce-clothing-reviews)
(or any CSV with `review` + `rating` columns), then:
```bash
cd backend
python -m ml.train_sentiment_model --csv data/reviews/reviews.csv
```
Saves `models_store/sentiment.pkl` + `models_store/vectorizer.pkl`. Restart the
backend afterward.

### Chatbot
Edit `backend/ml/intents.json` to add/adjust FAQ patterns and responses — no
retraining step needed, it's read at request time.

---

## 4. Project structure

```
smart-retail-platform/
├── backend/
│   ├── app/
│   │   ├── main.py            FastAPI app + router wiring
│   │   ├── config.py          Settings (env-driven)
│   │   ├── database.py        SQLAlchemy engine/session
│   │   ├── security.py        Password hashing, JWT
│   │   ├── deps.py            Auth/role dependencies
│   │   ├── models/            SQLAlchemy ORM models
│   │   ├── schemas/           Pydantic request/response schemas
│   │   ├── routers/           One file per API resource
│   │   ├── services/          Face, classifier, sentiment, chatbot logic
│   │   └── utils/             File upload helpers
│   ├── ml/                    Training scripts + intents.json
│   ├── scripts/seed.py        Demo data seeder
│   ├── database/schema.sql    Reference SQL schema
│   ├── data/                  Your face/product/review data (gitignored)
│   ├── models_store/          Trained model artifacts (gitignored)
│   ├── tests/                 Pytest suite (SQLite-backed, no Docker needed)
│   └── Dockerfile
├── frontend/
│   └── src/
│       ├── pages/              One page per module (dashboard, face, products…)
│       ├── components/         layout/, ui/, charts/
│       ├── context/             Auth + theme (dark/light) providers
│       ├── lib/                 Axios instance, utils
│       └── routes/AppRoutes.tsx
├── docker/postgres/            DB init scripts
├── docker-compose.yml
└── docs/API.md
```

---

## 5. Modules implemented

1. **Authentication** — signup, login, forgot/reset password, JWT, role-based access (admin/employee/customer). Google login is intentionally left as a documented extension point (`GOOGLE_CLIENT_ID` in `.env`) rather than faked, since wiring real OAuth needs a registered app.
2. **Dashboard** — live stat cards, line/bar/pie charts, recent activity, backed by `/analytics`.
3. **Face Recognition** — register + recognize, confidence score, visit logging, unknown-face handling.
4. **Product Recognition** — image upload, category + confidence, top-k predictions.
5. **Review Sentiment** — single review + bulk CSV, positive/negative/neutral, confidence, per-source breakdown.
6. **FAQ Chatbot** — rule-based matching with a TF-IDF fallback, typing indicator, conversation history.
7. **Customer Management** — CRUD, search, pagination, filter, CSV export, visit logs.
8. **Product Management** — CRUD, image upload, categories, stock, price.
9. **Analytics** — visitor trend, top categories, review stats, recognition confidence (revenue is a labeled placeholder — wire up a POS/payments integration to populate it for real).
10. **Admin Panel** — user management, role changes, DB/model/API status.

## 6. Honest limitations (so nothing here overclaims)

- No real ML training happened when this repo was generated — the training scripts are
  complete and tested for correctness of logic, but actually fitting them needs the
  datasets above and a machine with internet access.
- "Revenue" in Analytics is explicitly a placeholder since there's no payments data source.
- Google Login is not implemented (no way to register a free OAuth client here) — the
  scaffolding (`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` in `.env`) is there for you to
  finish if needed.
- Face recognition tolerance and sentiment/chatbot confidence thresholds are reasonable
  defaults in `backend/.env` — tune `FACE_MATCH_TOLERANCE`, `SENTIMENT_MIN_CONFIDENCE`,
  `CHATBOT_MIN_CONFIDENCE` against your own data.
