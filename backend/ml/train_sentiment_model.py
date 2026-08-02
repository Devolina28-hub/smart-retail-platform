"""
Trains a TF-IDF + Logistic Regression sentiment classifier on a labeled
reviews CSV and saves it to backend/models_store/.

Expected CSV columns: customer_id, product_id, review, rating
(rating is used to derive the sentiment label: >=4 positive, ==3 neutral, <=2 negative;
if your CSV already has a `sentiment` column, pass --label-column sentiment instead.)

Works directly with Kaggle's "Women's E-Commerce Clothing Reviews" dataset —
point --csv at the downloaded file.

Usage:
    python -m ml.train_sentiment_model --csv data/reviews/reviews.csv

Outputs:
    backend/models_store/sentiment.pkl
    backend/models_store/vectorizer.pkl
"""
import argparse
import os
import sys

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models_store")


def rating_to_sentiment(rating: float) -> str:
    if rating >= 4:
        return "positive"
    if rating == 3:
        return "neutral"
    return "negative"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True, help="Path to labeled reviews CSV")
    parser.add_argument("--text-column", default="review")
    parser.add_argument("--label-column", default=None, help="If set, use this column directly as the sentiment label")
    parser.add_argument("--rating-column", default="rating")
    args = parser.parse_args()

    if not os.path.exists(args.csv):
        print(f"CSV not found at {args.csv}")
        return

    df = pd.read_csv(args.csv)
    df = df.dropna(subset=[args.text_column])

    if args.label_column and args.label_column in df.columns:
        df["label"] = df[args.label_column]
    else:
        df = df.dropna(subset=[args.rating_column])
        df["label"] = df[args.rating_column].apply(rating_to_sentiment)

    X_train, X_test, y_train, y_test = train_test_split(
        df[args.text_column], df["label"], test_size=0.2, random_state=42, stratify=df["label"]
    )

    vectorizer = TfidfVectorizer(max_features=20000, ngram_range=(1, 2), stop_words="english")
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    model = LogisticRegression(max_iter=1000, class_weight="balanced")
    model.fit(X_train_vec, y_train)

    print(classification_report(y_test, model.predict(X_test_vec)))

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, os.path.join(MODEL_DIR, "sentiment.pkl"))
    joblib.dump(vectorizer, os.path.join(MODEL_DIR, "vectorizer.pkl"))
    print(f"Saved model + vectorizer to {MODEL_DIR}")


if __name__ == "__main__":
    main()
