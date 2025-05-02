import os
import shutil
import numpy as np
import json
import cv2
import firebase_admin
from flask import Flask, request, jsonify
from flask_cors import CORS
from train_and_export import train_and_export_model  # Import from your training function
from mtcnn import MTCNN
from firebase_admin import credentials, storage
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv

# Memuat variabel lingkungan dari file .env.local
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# === Config Paths ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "..", "public", "models", "face_recognition")
NIM_LOG_FILE = os.path.join(BASE_DIR, "..", "last_registered_nim.txt")

# Firebase Admin SDK initialization with credentials from environment variable
if not firebase_admin._apps:
    cred_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')  # Get path to credentials from environment
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred, {'storageBucket': 'tugas-akhir-c22c5.appspot.com'})

# Firebase storage reference
bucket = storage.bucket()

# Initialize MTCNN (For Face Detection in Registration)
mtcnn_detector = MTCNN()

@app.route("/upload-face", methods=["POST"])
def upload_face():
    """Upload screenshot wajah ke Firebase berdasarkan matkul/pertemuan"""
    if 'image' not in request.files:
        return jsonify({"message": "No image file provided."}), 400

    image = request.files['image']
    nim = request.form.get("nim")
    matkul = request.form.get("matkul")
    pertemuan = request.form.get("pertemuan")

    if not nim or not matkul or not pertemuan:
        return jsonify({"message": "NIM, matkul, atau pertemuan tidak lengkap"}), 400

    try:
        # Baca gambar sebagai byte
        img = Image.open(image)
        img_byte_arr = BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()

        # Nama dan path file di Firebase
        filename = f"{nim}_face.png"
        storage_path = f"faces/{matkul}/{pertemuan}/{filename}"

        blob = bucket.blob(storage_path)
        blob.upload_from_string(img_byte_arr, content_type='image/png')

        file_url = blob.public_url

        return jsonify({
            "message": "✅ Wajah berhasil disimpan",
            "url": file_url,
            "path": storage_path
        }), 200

    except Exception as e:
        print("❌ Error saat upload wajah:", e)
        return jsonify({"message": "Gagal upload gambar."}), 500


@app.route("/register-image", methods=["POST"])
def register_image():
    """Upload gambar wajah + trigger retrain otomatis"""
    if "file" not in request.files or "nim" not in request.form:
        return jsonify({"error": "Missing file or NIM"}), 400

    file = request.files["file"]
    nim = request.form["nim"].strip()

    if not nim or not nim.isdigit() or len(nim) != 10:
        return jsonify({"error": "NIM tidak valid"}), 400

    try:
        filename = f"{nim}_{np.random.randint(100000)}.jpg"

        img = file.read()
        img_array = np.frombuffer(img, np.uint8)
        image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        faces = mtcnn_detector.detect_faces(image_rgb)
        if len(faces) == 0:
            return jsonify({"error": "No face detected in the image"}), 400

        x, y, w, h = faces[0]['box']
        face_crop = image_rgb[y:y+h, x:x+w]
        _, buffer = cv2.imencode('.jpg', cv2.cvtColor(face_crop, cv2.COLOR_RGB2BGR))

        blob = bucket.blob(f"dataset/{nim}/{filename}")
        blob.upload_from_string(buffer.tobytes(), content_type="image/jpeg")
        blob.make_public()
        file_url = blob.public_url

        with open(NIM_LOG_FILE, "w") as f:
            f.write(nim)

        print("✅ Wajah berhasil diupload. Sekarang melatih ulang model...")

        # Mulai training model ulang
        train_result = train_and_export_model()
        print("✅ Model retrained:", train_result)

        return jsonify({
            "message": "✅ Gambar disimpan dan model dilatih ulang!",
            "url": file_url,
            "classes": train_result.get("classes", [])
        }), 200

    except Exception as e:
        print("❌ Error saat proses:", e)
        return jsonify({"error": str(e)}), 500




@app.route("/train-model", methods=["POST"])
def train_model_route():
    """Train model + export otomatis ke TensorFlow.js + buat labels.json"""
    try:
        print("🔄 Mulai pelatihan model...")

        # Log untuk memastikan training dimulai
        print("📝 Menyusun data dari Firebase untuk pelatihan...")
        # Start training directly from Firebase dataset
        result = train_and_export_model()  # Call the training function

        print("✅ Training selesai, upload model ke Firebase.")
        # Upload the trained model to Firebase Storage
        export_model_path = os.path.join(BASE_DIR, "model_export")
        shutil.rmtree(export_model_path, ignore_errors=True)
        os.makedirs(export_model_path, exist_ok=True)

        # Export the model to a temporary directory
        result = train_and_export_model()

        # Upload model files to Firebase
        for file_name in os.listdir(export_model_path):
            file_path = os.path.join(export_model_path, file_name)
            blob = bucket.blob(f"models/face_recognition/{file_name}")
            blob.upload_from_filename(file_path)

        return jsonify({"status": "success", "message": "✅ Training selesai dan model di-upload ke Firebase!"}), 200

    except Exception as e:
        print(f"❌ Error training model: {str(e)}")  # Log error lebih lanjut
        return jsonify({"status": "error", "message": str(e)}), 500

# === Fetching Model and Labels from Firebase ===

@app.route("/models/face_recognition/labels.json", methods=["GET"])
def serve_labels():
    try:
        blob = bucket.blob("models/face_recognition/labels.json")
        file_content = blob.download_as_string()  # Mengunduh file
        return file_content, 200, {'Content-Type': 'application/json'}
    except Exception as e:
        return jsonify({"error": f"Failed to fetch labels.json: {str(e)}"}), 500


@app.route("/models/face_recognition/model.json", methods=["GET"])
def serve_model():
    try:
        blob = bucket.blob("models/face_recognition/model.json")
        file_content = blob.download_as_string()
        return file_content, 200, {'Content-Type': 'application/json'}
    except Exception as e:
        return jsonify({"error": f"Failed to fetch model.json: {str(e)}"}), 500


@app.route("/models/face_recognition/group1-shard1of1.bin", methods=["GET"])
def serve_bin_file():
    try:
        blob = bucket.blob("models/face_recognition/group1-shard1of1.bin")
        file_content = blob.download_as_string()  # Mengunduh file binary
        return file_content, 200, {'Content-Type': 'application/octet-stream'}
    except Exception as e:
        return jsonify({"error": f"Failed to fetch group1-shard1of1.bin: {str(e)}"}), 500


# === Main ===
if __name__ == "__main__":
    app.run(debug=True, port=8000)
