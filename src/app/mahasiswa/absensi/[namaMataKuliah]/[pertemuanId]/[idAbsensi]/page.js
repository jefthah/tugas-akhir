"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import NavbarMahasiswaCourse from "@/components/NavbarMahasiswaCourse";
import SidebarMahasiswa from "@/components/SidebarMahasiswa";
import HeaderMahasiswaCourse from "@/components/HeaderMahasiswaCourse";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const AbsensiDetail = ({ params }) => {
  const router = useRouter();
  const namaMataKuliah = decodeURIComponent(params.namaMataKuliah || "");
  const pertemuanId = decodeURIComponent(params.pertemuanId || "");
  const idAbsensi = decodeURIComponent(params.idAbsensi || "");

  const [absensi, setAbsensi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusPresensi, setStatusPresensi] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userNIM, setUserNIM] = useState(null);

  // Ambil NIM dari cookie
  useEffect(() => {
    const cookie = Cookies.get("session_mahasiswa");
    if (cookie) {
      try {
        const parsed = JSON.parse(cookie);
        setUserNIM(parsed.nim);
      } catch (err) {
        console.error("❌ Gagal parsing cookie session_mahasiswa:", err);
      }
    } else {
      console.warn("⚠️ Cookie session_mahasiswa tidak ditemukan");
    }
  }, []);

  // Ambil data absensi & status presensi mahasiswa
  useEffect(() => {
    const fetchAbsensi = async () => {
      try {
        const absensiRef = doc(
          db,
          "mataKuliah",
          namaMataKuliah,
          "Pertemuan",
          pertemuanId,
          "Absensi",
          idAbsensi
        );

        const absensiDoc = await getDoc(absensiRef);
        if (absensiDoc.exists()) {
          setAbsensi(absensiDoc.data());

          if (userNIM) {
            const studentRef = doc(absensiRef, "Mahasiswa", userNIM);
            const studentDoc = await getDoc(studentRef);
            if (studentDoc.exists()) {
              const data = studentDoc.data();
              if (data.status === "hadir") {
                setStatusPresensi("Hadir");
              } else if (data.status === "tidak hadir") {
                setStatusPresensi("Tidak Hadir");
              }
            }
          }
        } else {
          console.error("Absensi tidak ditemukan.");
        }
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userNIM) fetchAbsensi();
  }, [userNIM, namaMataKuliah, pertemuanId, idAbsensi]);

  const saveAttendance = () => {
    router.push(
      `/mahasiswa/face-recognition?matkul=${encodeURIComponent(
        namaMataKuliah
      )}&pertemuan=${encodeURIComponent(
        pertemuanId
      )}&absensi=${encodeURIComponent(idAbsensi)}`
    );
  };

  const saveNonAttendance = async () => {
    if (!userNIM) {
      alert("❌ NIM tidak ditemukan.");
      return;
    }

    try {
      const studentRef = doc(
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

      await setDoc(studentRef, {
        status: "tidak hadir",
        time: new Date().toISOString(),
      });

      setStatusPresensi("Tidak Hadir");
      alert("🚫 Presensi tidak hadir dicatat.");
    } catch (err) {
      console.error("Gagal menyimpan kehadiran:", err);
      alert("❌ Gagal menyimpan presensi.");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
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
          title={`2024 GANJIL | ${namaMataKuliah.toUpperCase()}`}
          path={[
            "Dashboard",
            "Courses",
            "2024/2025 Ganjil",
            namaMataKuliah,
            "Detail Absensi",
          ]}
        />

        <main className="flex-1 p-8 bg-gray-50">
          <section className="container mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Detail Absensi
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="py-3 px-6 text-left">Date</th>
                    <th className="py-3 px-6 text-left">Description</th>
                    <th className="py-3 px-6 text-left">Status</th>
                    <th className="py-3 px-6 text-left">Points</th>
                    <th className="py-3 px-6 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-t">
                    <td className="py-4 px-6">{absensi?.date || "-"}</td>
                    <td className="py-4 px-6">{namaMataKuliah}</td>
                    <td className="py-4 px-6 font-semibold">
                      {statusPresensi || "-"}
                    </td>
                    <td className="py-4 px-6">
                      {statusPresensi === "Hadir" ? "100" : "0"}
                    </td>
                    <td className="py-4 px-6">
                      {statusPresensi === "Hadir"
                        ? "Presensi Berhasil"
                        : statusPresensi === "Tidak Hadir"
                        ? "Tidak Hadir"
                        : "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {!statusPresensi && (
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                <button
                  onClick={saveAttendance}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md font-semibold"
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

            {statusPresensi && (
              <div className="text-center text-green-600 font-medium mt-6">
                ✅ Anda sudah melakukan presensi.
              </div>
            )}
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AbsensiDetail;
