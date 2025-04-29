import os
import shutil
import numpy as np
import json
import cv2
import pandas as pd
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.utils import class_weight
import tensorflowjs as tfjs
import mediapipe as mp

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset_model_skripsi")
EXPORT_DIR = os.path.join(BASE_DIR, "..", "public", "models", "face_recognition")

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

def extract_landmarks(image):
    results = face_mesh.process(image)
    if results.multi_face_landmarks:
        landmarks = []
        for face_landmarks in results.multi_face_landmarks:
            for lm in face_landmarks.landmark:
                landmarks.extend([lm.x, lm.y, lm.z])
        return np.array(landmarks)
    return None

def train_and_export_model():
    """Training + Export TensorFlow.js format + labels.json"""
    print("📊 Mulai ekstraksi fitur wajah dan pelatihan model...")  # Log debug
    X, y = [], []
    for label in os.listdir(DATASET_DIR):
        folder = os.path.join(DATASET_DIR, label)
        if not os.path.isdir(folder):
            continue
        for img in os.listdir(folder):
            path = os.path.join(folder, img)
            image = cv2.imread(path)
            if image is not None:
                img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                landmarks = extract_landmarks(img_rgb)
                if landmarks is not None:
                    X.append(landmarks)
                    y.append(label)

    if len(X) == 0:
        print("❌ Tidak ada data untuk training.")  # Log jika data kosong
        raise ValueError("❌ Tidak ada data untuk training.")
    
    # Log jumlah data yang digunakan untuk training
    print(f"📊 Total data: {len(X)} gambar")

    X = np.array(X)
    y = np.array(y)

    # Log label unik yang ditemukan dalam dataset
    print(f"🧑‍🏫 Label unik ditemukan: {np.unique(y)}")

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    # Log hasil encoding label
    print(f"🔢 Hasil encoding label: {y_encoded}")

    y_cat = to_categorical(y_encoded)

    X_train, X_test, y_train, y_test = train_test_split(X, y_cat, test_size=0.2, random_state=42)
    
    # Log pembagian data training dan testing
    print(f"📦 Data training: {len(X_train)}, Data testing: {len(X_test)}")

    class_weights = class_weight.compute_class_weight('balanced', classes=np.unique(y_encoded), y=y_encoded)
    class_weights = dict(enumerate(class_weights))

    model = Sequential([
        Dense(256, activation='relu', input_shape=(X.shape[1],)),
        BatchNormalization(),
        Dropout(0.5),
        Dense(128, activation='relu'),
        BatchNormalization(),
        Dropout(0.3),
        Dense(64, activation='relu'),
        Dense(len(label_encoder.classes_), activation='softmax')
    ])

    model.compile(optimizer=Adam(0.001), loss='categorical_crossentropy', metrics=['accuracy'])

    print("📈 Melatih model dengan data...")  # Log melatih model
    model.fit(X_train, y_train, epochs=20, validation_data=(X_test, y_test), class_weight=class_weights)

    # Save TensorFlow.js model
    if os.path.exists(EXPORT_DIR):
        shutil.rmtree(EXPORT_DIR)
    os.makedirs(EXPORT_DIR, exist_ok=True)

    tfjs.converters.save_keras_model(model, EXPORT_DIR)

    # Save label encoder
    labels_path = os.path.join(EXPORT_DIR, "labels.json")
    with open(labels_path, "w") as f:
        f.write(json.dumps({str(i): name for i, name in enumerate(label_encoder.classes_)}))

    return {
        "classes": label_encoder.classes_.tolist(),
        "message": "✅ Training dan export selesai."
    }
