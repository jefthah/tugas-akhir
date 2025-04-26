"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import NavbarHome from "@/components/NavbarHome";
import Footer from "@/components/Footer";
import Cookies from "js-cookie";
import * as faceapi from "face-api.js";

export default function FaceRegistrationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: "", nim: "", email: "" });
  const [message, setMessage] = useState("");
  const [capturedCount, setCapturedCount] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const videoRef = useRef(null);
  const router = useRouter();
  const streamRef = useRef(null);

  // Load face-api.js model
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(
          "/models/tiny_face_detector"
        );
        console.log("✅ Model face-api.js loaded");
      } catch (error) {
        console.error("❌ Error loading model:", error);
        setMessage("❌ Gagal memuat model deteksi wajah.");
      }
    };
    loadModels();
  }, []);

  const captureAndUpload = useCallback(async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn("⚠️ Video belum siap, width/height = 0");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("❌ Tidak bisa mendapatkan context canvas");
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 🔍 Deteksi wajah
    const detection = await faceapi.detectSingleFace(
      canvas,
      new faceapi.TinyFaceDetectorOptions()
    );

    if (!detection) {
      setMessage("⚠️ Arahkan wajah Anda ke kamera.");
      return;
    }

    // ✅ lanjutkan upload
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg")
    );

    const formData = new FormData();
    formData.append("file", blob);
    formData.append("nim", user.nim);

    try {
      const response = await fetch("http://localhost:8000/register-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        const newCount = capturedCount + 1;
        setCapturedCount(newCount);
        setMessage(`✅ Gambar ${newCount}/5 berhasil disimpan`);

        if (newCount === 5) {
          setIsTraining(true);
          setMessage("⏳ Melatih model...");

          const trainRes = await fetch("http://localhost:8000/train-model", {
            method: "POST",
            body: new URLSearchParams({ nim: user.nim }),
          });

          const trainJson = await trainRes.json();
          setIsTraining(false);

          if (trainRes.ok) {
            setMessage("✅ Pelatihan selesai. Mengalihkan ke login...");

            // 🛑 Matikan kamera dulu
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop());
              streamRef.current = null;
            }

            Cookies.remove("session_mahasiswa");
            setTimeout(() => router.push("/mahasiswa/login"), 2000);
          } else {
            setMessage("⚠️ Gagal melatih model: " + trainJson.output);
          }
        }
      } else {
        setMessage("❌ Gagal menyimpan gambar: " + result.error);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("❌ Terjadi kesalahan saat upload.");
    }
  }, [capturedCount, router, user.nim]);

  // Ambil data session dari cookie
  useEffect(() => {
    const session = JSON.parse(Cookies.get("session_mahasiswa") || "null");
    if (session?.isLoggedIn) {
      setIsLoggedIn(true);
      setUser(session);
    }
  }, []);

  // Nyalakan kamera
  useEffect(() => {
    let stream;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((s) => {
        streamRef.current = s; // simpan ke ref
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })

      .catch((error) => {
        console.error("Camera error:", error);
        setMessage("❌ Kamera tidak tersedia.");
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Auto capture wajah
  useEffect(() => {
    if (!videoRef.current || capturedCount >= 5 || user.nim.length !== 10)
      return;

    const interval = setInterval(() => {
      captureAndUpload();
    }, 1500);

    return () => clearInterval(interval);
  }, [capturedCount, user.nim, captureAndUpload]);

  return (
    <div className="min-h-screen bg-white">
      <NavbarHome
        isLoggedIn={isLoggedIn}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userData={user}
      />

      <div className="h-[40vh] bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 pt-24 flex flex-col justify-center items-center text-white">
        <h1 className="text-3xl sm:text-4xl font-bold">Pendaftaran Wajah</h1>
        <p className="text-sm sm:text-lg mt-2">Beranda / Pendaftaran Wajah</p>
      </div>

      <main className="flex flex-col items-center justify-center py-12 px-6 bg-white">
        <div className="max-w-xl w-full bg-gray-50 border border-gray-200 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Kamera Otomatis
          </h2>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-[400px] object-cover bg-black rounded"
          />
          <p className="text-center text-sm text-gray-500 mt-2">
            Gambar: {capturedCount} / 5
          </p>

          {isTraining && (
            <div className="text-center mt-4 text-blue-600 font-medium">
              <div className="flex justify-center mb-2">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-600 border-solid"></div>
              </div>
              Sedang melatih model...
            </div>
          )}

          {message && (
            <p
              className={`text-center mt-4 font-medium ${
                message.startsWith("❌") || message.startsWith("⚠️")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
