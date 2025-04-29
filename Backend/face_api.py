from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import shutil
from train_and_export import train_and_export_model  # Import dari file baru

app = Flask(__name__)
CORS(app)

# === Config Paths ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset_model_skripsi")
MODEL_DIR = os.path.join(BASE_DIR, "..", "public", "models", "face_recognition")
NIM_LOG_FILE = os.path.join(BASE_DIR, "..", "last_registered_nim.txt")

# === Basic Routes ===

@app.route("/")
def index():
    return jsonify({"message": "Flask API aktif 🔥"})

@app.route("/register-image", methods=["POST"])
def register_image():
    """Upload gambar wajah untuk satu NIM"""
    if "file" not in request.files or "nim" not in request.form:
        return jsonify({"error": "Missing file or NIM"}), 400

    file = request.files["file"]
    nim = request.form["nim"].strip()

    if not nim or not nim.isdigit() or len(nim) != 10:
        return jsonify({"error": "NIM tidak valid"}), 400

    save_folder = os.path.join(DATASET_DIR, nim)
    os.makedirs(save_folder, exist_ok=True)

    existing_files = [f for f in os.listdir(save_folder) if f.endswith((".jpg", ".png", ".jpeg"))]
    filename = f"{nim}_{len(existing_files) + 1}.jpg"
    save_path = os.path.join(save_folder, filename)

    file.save(save_path)

    # Update last registered NIM (opsional)
    with open(NIM_LOG_FILE, "w") as f:
        f.write(nim)

    return jsonify({"message": f"✅ Gambar berhasil disimpan: {filename}"}), 200

@app.route("/train-model", methods=["POST"])
def train_model_route():
    """Train model + export otomatis ke TensorFlow.js + buat labels.json"""
    try:
        print("🔄 Memulai proses pelatihan model...")  # Log proses pelatihan
        # Bersihkan model lama dulu
        if os.path.exists(MODEL_DIR):
            shutil.rmtree(MODEL_DIR)
        os.makedirs(MODEL_DIR, exist_ok=True)

        result = train_and_export_model()
        print("✅ Model selesai dilatih dan diekspor.")  # Log jika pelatihan berhasil
        return jsonify({
            "status": "success",
            "output": result
        }), 200

    except Exception as e:
        print(f"❌ Error saat training: {e}")  # Menampilkan detail error
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# === Main ===

if __name__ == "__main__":
    app.run(debug=True, port=8000)
