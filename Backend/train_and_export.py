import os
import shutil
import numpy as np
import json
import cv2
import firebase_admin
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import tensorflowjs as tfjs
import mediapipe as mp
from firebase_admin import credentials, storage

# Setup Firebase Admin SDK
cred = credentials.Certificate(os.path.join(os.path.dirname(os.path.abspath(__file__)), "lib", "serviceAccountKey.json"))
firebase_admin.initialize_app(cred, {
    'storageBucket': 'tugas-akhir-c22c5.appspot.com'  # Firebase storage bucket name
})

# Firebase storage reference
bucket = storage.bucket()

# Directories for dataset and export (Note: not used for local storage)
EXPORT_DIR = "/tmp/model_export"  # Temporary export directory, used in-memory for now

# MediaPipe FaceMesh for feature extraction
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

def upload_model_to_firebase(export_model_path):
    """Upload the trained model files to Firebase"""
    # Loop through the model files and upload them to Firebase
    for file_name in os.listdir(export_model_path):
        file_path = os.path.join(export_model_path, file_name)
        blob = bucket.blob(f"models/face_recognition/{file_name}")
        blob.upload_from_filename(file_path)
        print(f"File {file_name} berhasil di-upload ke Firebase.")

def train_and_export_model():
    """Training + Export TensorFlow.js format + labels.json"""
    print("📊 Mulai ekstraksi fitur wajah dan pelatihan model...")  # Log debug
    X, y = [], []

    # Get all the image blobs from Firebase
    blobs = list(bucket.list_blobs(prefix="dataset/"))
    print(f"Data ditemukan: {len(blobs)} gambar")

    for blob in blobs:
        print(f"Mengambil file: {blob.name}")
        img_data = blob.download_as_string()
        nparr = np.frombuffer(img_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is not None:
            img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            landmarks = extract_landmarks(img_rgb)
            if landmarks is not None:
                X.append(landmarks)
                y.append(blob.name.split('/')[1])  # Extract label from the folder name

    if len(X) == 0:
        print("❌ Tidak ada data untuk training.")  # Log if data is empty
        raise ValueError("❌ Tidak ada data untuk training.")
    
    # Log the number of images used for training
    print(f"📊 Total data: {len(X)} gambar")

    X = np.array(X)
    y = np.array(y)

    # Log unique labels found in the dataset
    print(f"🧑‍🏫 Label unik ditemukan: {np.unique(y)}")

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    # Log the encoding result
    print(f"🔢 Hasil encoding label: {y_encoded}")

    y_cat = to_categorical(y_encoded)  # One-hot encode labels

    X_train, X_test, y_train, y_test = train_test_split(X, y_cat, test_size=0.2, random_state=42)
    
    # Log training and testing data distribution
    print(f"📦 Data training: {len(X_train)}, Data testing: {len(X_test)}")

    # Neural Network Model
    model = Sequential([
        Dense(256, activation='relu', input_shape=(X.shape[1],)),
        BatchNormalization(),
        Dropout(0.5),
        Dense(128, activation='relu'),
        BatchNormalization(),
        Dropout(0.3),
        Dense(64, activation='relu'),
        Dense(len(label_encoder.classes_), activation='softmax')  # Output number of classes
    ])

    model.compile(optimizer=Adam(0.001), loss='categorical_crossentropy', metrics=['accuracy'])

    print("📈 Melatih model dengan data...")  # Log model training
    model.fit(X_train, y_train, epochs=20, validation_data=(X_test, y_test))

    # Save TensorFlow.js model
    if os.path.exists(EXPORT_DIR):
        shutil.rmtree(EXPORT_DIR)
    os.makedirs(EXPORT_DIR, exist_ok=True)

    tfjs.converters.save_keras_model(model, EXPORT_DIR)

    # Save label encoder
    labels_path = os.path.join(EXPORT_DIR, "labels.json")
    with open(labels_path, "w") as f:
        f.write(json.dumps({str(i): name for i, name in enumerate(label_encoder.classes_)}))

    # Upload the model files to Firebase
    upload_model_to_firebase(EXPORT_DIR)

    return {
        "classes": label_encoder.classes_.tolist(),
        "message": "✅ Training dan export selesai."
    }
