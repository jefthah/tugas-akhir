from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import subprocess

app = Flask(__name__)
CORS(app)

# === Config ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset_model_skripsi")
MODEL_PATH = os.path.join(BASE_DIR, "face_recognition_mediapipe.h5")
NIM_LOG_FILE = os.path.join(BASE_DIR, "..", "last_registered_nim.txt")
PYTHON_PATH = os.path.join(BASE_DIR, "..", ".venv", "Scripts", "python.exe")  # sesuaikan kalau di Mac/Linux

@app.route("/")
def index():
    return jsonify({"message": "Flask API aktif"})


@app.route("/register-image", methods=["POST"])
def register_image():
    if "file" not in request.files or "nim" not in request.form:
        return jsonify({"error": "Missing file or NIM"}), 400

    file = request.files["file"]
    nim = request.form["nim"].strip()

    if not nim or not nim.isdigit() or len(nim) != 10:
        return jsonify({"error": "NIM tidak valid"}), 400

    print(f"[DEBUG] NIM diterima: {nim}")

    # ✅ BUAT FOLDER dataset_model_skripsi/<nim>
    save_path = os.path.join(DATASET_DIR, nim)
    os.makedirs(save_path, exist_ok=True)

    existing_files = [f for f in os.listdir(save_path) if f.startswith(nim)]
    file_count = len(existing_files)
    filename = f"{nim}_{file_count + 1}.jpg"

    file_path = os.path.join(save_path, filename)
    file.save(file_path)

    # Simpan NIM terakhir
    with open(NIM_LOG_FILE, "w") as f:
        f.write(nim)

    return jsonify({"message": f"✅ Gambar berhasil disimpan di {file_path}"})




@app.route("/train-model", methods=["POST"])
def train_model():
    try:
        if not os.path.exists(NIM_LOG_FILE):
            return jsonify({"error": "Tidak ada NIM terdaftar"}), 400

        result = subprocess.run(
            [PYTHON_PATH, "Backend/train.py"],
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            return jsonify({"status": "success", "output": result.stdout})
        else:
            return jsonify({"status": "error", "output": result.stderr}), 500

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=8000)
