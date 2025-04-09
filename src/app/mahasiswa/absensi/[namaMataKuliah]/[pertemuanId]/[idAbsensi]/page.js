"use client";
import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import Webcam from "react-webcam";

const Breadcrumb = ({ path }) => (
  <nav className="text-white text-sm mt-2 text-center">
    {path.map((item, index) => (
      <span key={index}>
        {item}
        {index < path.length - 1 && " / "}
      </span>
    ))}
  </nav>
);

const AbsensiDetail = ({ params }) => {
  const router = useRouter();
  const namaMataKuliah = decodeURIComponent(params.namaMataKuliah || "");
  const pertemuanId = decodeURIComponent(params.pertemuanId || "");
  const idAbsensi = decodeURIComponent(params.idAbsensi || "");

  const [absensi, setAbsensi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAttending, setIsAttending] = useState(null);
  const [isNotAttending, setIsNotAttending] = useState(null);
  const webcamRef = useRef(null);

  const sessionData =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("session_mahasiswa"))
      : null;
  const userNIM = sessionData?.nimOrNip || null;

  useEffect(() => {
    console.log("🔎 Mencari absensi untuk:", namaMataKuliah, pertemuanId, idAbsensi);

    const fetchAbsensi = async () => {
      try {
        if (!namaMataKuliah || !pertemuanId || !idAbsensi) {
          console.error("⚠️ Parameter tidak lengkap.");
          return;
        }

        const absensiRef = doc(
          db,
          "mataKuliah",
          namaMataKuliah,
          "Pertemuan",
          pertemuanId,
          "Absensi",
          idAbsensi
        );

        console.log("📌 Query Firestore:", absensiRef.path);

        const absensiDoc = await getDoc(absensiRef);
        if (absensiDoc.exists()) {
          console.log("✅ Absensi ditemukan:", absensiDoc.data());
          setAbsensi(absensiDoc.data());

          // Cek apakah mahasiswa sudah absen
          if (userNIM) {
            const studentAttendanceRef = doc(
              db,
              "mataKuliah",
              namaMataKuliah,
              "Pertemuan",
              pertemuanId,
              "Absensi",
              idAbsensi,
              "Mahasiswa",
              userNIM
            );

            const studentAttendanceDoc = await getDoc(studentAttendanceRef);
            if (studentAttendanceDoc.exists()) {
              if (studentAttendanceDoc.data().isAvailable) {
                setIsAttending("Sudah Hadir");
              } else {
                setIsNotAttending("Tidak Hadir");
              }
            }
          }
        } else {
          console.error("❌ Absensi tidak ditemukan di Firestore.");
        }
      } catch (error) {
        console.error("⚠️ Error saat mengambil absensi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAbsensi();
  }, [namaMataKuliah, pertemuanId, idAbsensi, userNIM]);

  const saveAttendance = async () => {
    try {
      if (!userNIM) {
        alert("❌ Gagal menyimpan kehadiran: Data pengguna tidak ditemukan.");
        return;
      }

      const studentAttendanceRef = doc(
        db,
        "mataKuliah",
        namaMataKuliah,
        "Pertemuan",
        pertemuanId,
        "Absensi",
        idAbsensi,
        "Mahasiswa",
        userNIM
      );

      await setDoc(studentAttendanceRef, { isAvailable: true });
      setIsAttending("Sudah Hadir");
      setIsNotAttending(null);
      alert("✅ Kehadiran berhasil disimpan.");
    } catch (error) {
      console.error("❌ Gagal menyimpan kehadiran:", error);
    }
  };

  const saveNonAttendance = async () => {
    try {
      if (!userNIM) {
        alert("❌ Gagal menyimpan ketidakhadiran: Data pengguna tidak ditemukan.");
        return;
      }

      const studentAttendanceRef = doc(
        db,
        "mataKuliah",
        namaMataKuliah,
        "Pertemuan",
        pertemuanId,
        "Absensi",
        idAbsensi,
        "Mahasiswa",
        userNIM
      );

      await setDoc(studentAttendanceRef, { isAvailable: false });
      setIsNotAttending("Tidak Hadir");
      setIsAttending(null);
      alert("✅ Status tidak hadir berhasil disimpan.");
    } catch (error) {
      console.error("❌ Gagal menyimpan ketidakhadiran:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <header className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            2024 Ganjil | {namaMataKuliah.toUpperCase()}
          </h1>
          <Breadcrumb
            path={[
              "Dashboard",
              "Courses",
              "2024/2025 Ganjil",
              namaMataKuliah,
              "Detail Absensi",
            ]}
          />
        </div>
      </header>
      <main className="flex-1 p-8">
        <section className="container mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Detail Absensi</h2>
          {absensi ? (
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-2xl font-semibold mb-4">Status Presensi</h2>
              {isAttending === "Sudah Hadir" ? (
                <p className="text-green-500 font-semibold">✅ Anda sudah melakukan absensi</p>
              ) : isNotAttending === "Tidak Hadir" ? (
                <p className="text-red-500 font-semibold">❌ Anda tidak hadir</p>
              ) : (
                <div>
                  <button
                    onClick={saveAttendance}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md font-semibold mr-4"
                  >
                    Hadir
                  </button>
                  <button
                    onClick={saveNonAttendance}
                    className="px-6 py-2 bg-red-500 text-white rounded-md font-semibold"
                  >
                    Tidak Hadir
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-500 font-semibold">❌ Absensi tidak ditemukan</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default AbsensiDetail;