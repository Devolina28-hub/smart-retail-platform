"""
Fine-tunes MobileNetV2 (ImageNet weights, frozen base) on a local product
image dataset and saves the result to backend/models_store/.

Expected layout (one folder per category):

    backend/data/products/
        Shoes/
            img1.jpg
            img2.jpg
        Tshirts/
            img1.jpg
        Phones/
        Books/
        Bags/

Works with a Kaggle set like "Fashion Product Images (Small)" — just sort
images into category subfolders first — or any custom photos you collect.

Usage:
    python -m ml.train_product_classifier --epochs 10

Outputs:
    backend/models_store/product_classifier.keras
    backend/models_store/product_labels.json
"""
import argparse
import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "products")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models_store")
IMAGE_SIZE = (224, 224)


def build_model(num_classes: int):
    import tensorflow as tf
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras import layers, models

    base = MobileNetV2(input_shape=(*IMAGE_SIZE, 3), include_top=False, weights="imagenet")
    base.trainable = False  # transfer learning: freeze the pretrained backbone

    model = models.Sequential([
        base,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.3),
        layers.Dense(128, activation="relu"),
        layers.Dense(num_classes, activation="softmax"),
    ])
    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
    return model


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch-size", type=int, default=32)
    args = parser.parse_args()

    import tensorflow as tf

    if not os.path.isdir(DATA_DIR) or not os.listdir(DATA_DIR):
        print(f"No product images found at {DATA_DIR}. Add category subfolders with images first.")
        return

    train_ds = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR, validation_split=0.2, subset="training", seed=42,
        image_size=IMAGE_SIZE, batch_size=args.batch_size, label_mode="categorical",
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR, validation_split=0.2, subset="validation", seed=42,
        image_size=IMAGE_SIZE, batch_size=args.batch_size, label_mode="categorical",
    )

    class_names = train_ds.class_names
    print(f"Found categories: {class_names}")

    normalization = tf.keras.layers.Rescaling(1.0 / 255)
    train_ds = train_ds.map(lambda x, y: (normalization(x), y)).prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.map(lambda x, y: (normalization(x), y)).prefetch(tf.data.AUTOTUNE)

    model = build_model(num_classes=len(class_names))
    model.fit(train_ds, validation_data=val_ds, epochs=args.epochs)

    os.makedirs(MODEL_DIR, exist_ok=True)
    model.save(os.path.join(MODEL_DIR, "product_classifier.keras"))
    with open(os.path.join(MODEL_DIR, "product_labels.json"), "w") as f:
        json.dump(class_names, f)

    print(f"Saved model + labels to {MODEL_DIR}")


if __name__ == "__main__":
    main()
