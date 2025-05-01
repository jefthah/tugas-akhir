"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import NavbarMahasiswaCourse from "@/components/NavbarMahasiswaCourse";
import SidebarMahasiswa from "@/components/SidebarMahasiswa";
import HeaderMahasiswaCourse from "@/components/HeaderMahasiswaCourse";
import Footer from "@/components/Footer";
import Webcam from "react-webcam";
import Cookies from "js-cookie";

import * as tf from "@tensorflow/tfjs";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/face_mesh";

const FaceRecognitionPage = () => {
  const router = useRouter();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detector, setDetector] = useState(null);
  const [model, setModel] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingRedirect, setLoadingRedirect] = useState(false);
  const [predictedText, setPredictedText] = useState(""); // For displaying NIM

  const searchParams = useSearchParams();
  const matkul = searchParams.get("matkul");
  const pertemuan = searchParams.get("pertemuan");
  const absensi = searchParams.get("absensi");

  const [userNIM, setUserNIM] = useState(null);
  const [labelEncoder, setLabelEncoder] = useState([]);

  useEffect(() => {
    const cookie = Cookies.get("session_mahasiswa");
    if (cookie) {
      const parsed = JSON.parse(cookie);
      setUserNIM(parsed.nim || null);
    }
  }, []);

  const fetchLabels = async () => {
    try {
      const response = await fetch("http://localhost:8000/models/face_recognition/labels.json"); // Backend API
      const labels = await response.json();
      setLabelEncoder(labels);
    } catch (error) {
      console.error("Failed to fetch labels.json", error);
    }
  };

  const loadModelFromBackend = async () => {
    try {
      const response = await fetch("http://localhost:8000/models/face_recognition/model.json"); // Backend API untuk model
      const modelLoaded = await tf.loadLayersModel(response.url); // Load model using TensorFlow.js
      setModel(modelLoaded);
      console.log("Model loaded successfully from backend");
    } catch (error) {
      console.error("Error loading model from backend:", error);
    }
  };
  

  const confirmAttendance = useCallback(async () => {
    if (!userNIM || !matkul || !pertemuan || !absensi) {
      alert("❌ Data presensi tidak lengkap.");
      return;
    }

    try {
      const mahasiswaPath = doc(
        db,
        "mataKuliah",
        matkul,
        "Pertemuan",
        pertemuan,
        "Absensi",
        absensi,
        "Mahasiswa",
        userNIM
      );

      await setDoc(mahasiswaPath, {
        status: "hadir",
        time: new Date().toISOString(),
      });

      router.push(`/mahasiswa/mataKuliah/${encodeURIComponent(matkul)}`);
    } catch (error) {
      console.error("Gagal menyimpan kehadiran:", error);
      alert("❌ Gagal mencatat kehadiran.");
    }
  }, [userNIM, matkul, pertemuan, absensi, router]);

  useEffect(() => {
    const loadModels = async () => {
      await tf.ready();
      const detectorLoaded = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        { runtime: "tfjs", refineLandmarks: true }
      );
      setDetector(detectorLoaded);
      await loadModelFromBackend(); // Load model from backend
      await fetchLabels(); // Fetch labels from backend
    };
    loadModels();
  }, []);

  useEffect(() => {
    let interval;

    const detectFace = async () => {
      if (
        !detector ||
        !model ||
        !webcamRef.current ||
        webcamRef.current.video?.readyState !== 4 ||
        isProcessing ||
        labelEncoder.length === 0 ||
        !userNIM
      )
        return;

      const video = webcamRef.current.video;
      const faces = await detector.estimateFaces(video);
      console.log("Detected faces: ", faces.length); // Log jumlah wajah terdeteksi
      const ctx = canvasRef.current.getContext("2d");
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      if (faces.length > 0) {
        const face = faces[0];
        const landmarks = face.keypoints;
        const features = landmarks.flatMap((p) => [
          p.x / video.width,
          p.y / video.height,
          p.z ?? 0,
        ]);

        const prediction = model.predict(tf.tensor([features]));
        const data = await prediction.data();
        console.log("Prediction data: ", data); // Log hasil prediksi model
        const predictedIndex = data.indexOf(Math.max(...data));
        const predictedLabel = labelEncoder[predictedIndex]?.toString().trim();
        const nimSession = userNIM?.toString().trim();

        console.log("Predicted NIM: ", predictedLabel); // Log NIM yang diprediksi

        // Update the UI with the predicted NIM
        setPredictedText("Mahasiswa dengan NIM: " + predictedLabel); // Display predicted NIM

        // If the predicted NIM matches the logged-in NIM
        if (predictedLabel === nimSession) {
          setIsProcessing(true);
          setLoadingRedirect(true);

          // Create a screenshot and send it to the backend
          const screenshot = webcamRef.current.getScreenshot();
          if (screenshot) {
            const formData = new FormData();
            formData.append("image", dataURItoBlob(screenshot)); // Convert screenshot to blob
            formData.append("nim", userNIM); // Send NIM as well

            try {
              const response = await fetch(
                "http://localhost:8000/upload-face",
                {
                  method: "POST",
                  body: formData, // Send the form data to backend
                }
              );
              const result = await response.json();
              if (response.ok) {
                await confirmAttendance(); // Call attendance after uploading
              } else {
                alert(result.message || "Failed to upload image.");
              }
            } catch (error) {
              console.error("Error sending image to backend:", error);
            }
          }
        }
      }
    };

    // Helper function to convert data URL (Base64) to Blob
    const dataURItoBlob = (dataURI) => {
      const byteString = atob(dataURI.split(",")[1]);
      const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);

      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }

      return new Blob([arrayBuffer], { type: mimeString });
    };

    interval = setInterval(detectFace, 1200);
    return () => clearInterval(interval);
  }, [model, detector, confirmAttendance, userNIM, isProcessing, labelEncoder]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {loadingRedirect && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-700 text-lg font-semibold">
            Mencatat kehadiran...
          </p>
        </div>
      )}

      <SidebarMahasiswa
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-80" : "ml-0"
        }`}
        onClick={() => sidebarOpen && setSidebarOpen(false)}
      >
        <NavbarMahasiswaCourse
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <HeaderMahasiswaCourse
          title="2024 GANJIL | FACE RECOGNITION"
          path={[
            "Dashboard",
            "Courses",
            "2024/2025 Ganjil",
            matkul || "Mata Kuliah",
            "Face Recognition",
          ]}
        />

        <main className="flex-1 p-8 bg-gray-50">
          <section className="container mx-auto bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Scan Wajah Anda
            </h2>

            <div className="relative flex flex-col items-center justify-center mb-6">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                width={400}
                height={300}
                className="rounded-lg border border-gray-300"
              />
              <canvas ref={canvasRef} className="absolute top-0 left-0" />
              {predictedText && (
                <p className="text-sm text-gray-600 mt-4">{predictedText}</p>
              )}
            </div>

            <p className="text-gray-500 text-sm">
              Sistem akan membaca wajah Anda secara otomatis...
            </p>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default FaceRecognitionPage;
