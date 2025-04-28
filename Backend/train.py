import os
import cv2
import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.regularizers import l2
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.utils import class_weight
import mediapipe as mp

# === Konfigurasi path ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset_model_skripsi")
NIM_LOG_FILE = os.path.join(BASE_DIR, "..", "last_registered_nim.txt")
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "face_recognition_mediapipe.h5")

# === Inisialisasi MediaPipe Face Mesh ===
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

def extract_landmarks(image):
    """Ekstraksi landmark wajah dari gambar menggunakan MediaPipe."""
    results = face_mesh.process(image)
    if results.multi_face_landmarks:
        landmarks = []
        for face_landmarks in results.multi_face_landmarks:
            for lm in face_landmarks.landmark:
                landmarks.extend([lm.x, lm.y, lm.z])
        return np.array(landmarks)
    return None

def train_model():
    """Melatih model dari dataset yang ada dan menyimpan model."""
    if not os.path.exists(NIM_LOG_FILE):
        raise FileNotFoundError("❌ NIM belum tersedia.")
    
    with open(NIM_LOG_FILE, "r") as f:
        user_id = f.read().strip()

    print(f"[INFO] Menggunakan NIM: {user_id}")

    # Load dataset
    X, y = [], []
    for label in os.listdir(DATASET_DIR):
        folder = os.path.join(DATASET_DIR, label)
        if not os.path.isdir(folder):
            continue
        for img in os.listdir(folder):
            if not img.lower().endswith((".jpg", ".png", ".jpeg")):
                continue
            path = os.path.join(folder, img)
            image = cv2.imread(path)
            if image is not None:
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                landmarks = extract_landmarks(image_rgb)
                if landmarks is not None:
                    X.append(landmarks)
                    y.append(label)

    if len(X) == 0:
        raise ValueError("❌ Tidak ada data ditemukan.")

    X = np.array(X)
    y = np.array(y)

    # Encode label
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    y_cat = to_categorical(y_encoded)

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y_cat, test_size=0.2, random_state=42)

    # Class weight untuk mengatasi dataset imbalance
    weights = class_weight.compute_class_weight('balanced', classes=np.unique(y_encoded), y=y_encoded)
    class_weights = dict(enumerate(weights))

    # Build model
    model = Sequential([
        Dense(256, activation='relu', input_shape=(X.shape[1],), kernel_regularizer=l2(0.01)),
        BatchNormalization(),
        Dropout(0.5),
        Dense(128, activation='relu', kernel_regularizer=l2(0.01)),
        BatchNormalization(),
        Dropout(0.3),
        Dense(64, activation='relu'),
        Dense(len(label_encoder.classes_), activation='softmax')
    ])
    model.compile(optimizer=Adam(0.001), loss='categorical_crossentropy', metrics=['accuracy'])

    # Training
    model.fit(X_train, y_train, epochs=20, validation_data=(X_test, y_test), class_weight=class_weights)

    # Simpan model
    model.save(MODEL_SAVE_PATH)
    print(f"✅ Model berhasil disimpan: {MODEL_SAVE_PATH}")
    print(pd.Series(y).value_counts())

    return {
        "message": f"✅ Model berhasil dilatih dan disimpan di {MODEL_SAVE_PATH}",
        "class_distribution": pd.Series(y).to_dict()
    }

# Jika dijalankan langsung (bukan di-import)
if __name__ == "__main__":
    result = train_model()
    print(result)
