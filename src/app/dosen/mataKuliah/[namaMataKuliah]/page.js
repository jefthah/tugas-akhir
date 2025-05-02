"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  addDoc,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import Image from "next/image";

const CourseDetailPage = ({ params }) => {
  const { namaMataKuliah } = params;
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTopicMap, setNewTopicMap] = useState({});
  const [error, setError] = useState("");
  const [attendanceData, setAttendanceData] = useState({});

  const decodedNamaMataKuliah = decodeURIComponent(namaMataKuliah);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setIsAuthChecked(true);
      else router.push("/dosen/login");
    });
    return () => unsubscribe();
  }, [router]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const courseRef = doc(db, "mataKuliah", decodedNamaMataKuliah);
      const courseDoc = await getDoc(courseRef);

      if (courseDoc.exists()) {
        setCourseData(courseDoc.data());

        const pertemuanRef = collection(courseRef, "Pertemuan");
        const snapshot = await getDocs(pertemuanRef);
        const topicList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTopics(topicList);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  const handleCreatePertemuan = async () => {
    try {
      const pertemuanRef = collection(
        db,
        "mataKuliah",
        decodedNamaMataKuliah,
        "Pertemuan"
      );
      const id = `Pertemuan ${topics.length + 1}`;
      await setDoc(doc(pertemuanRef, id), { topic: "" });
      await fetchCourseData();
    } catch (err) {
      console.error("Gagal tambah pertemuan:", err);
    }
  };

  const handleAddTopic = async (id, value) => {
    try {
      const refPertemuan = doc(
        db,
        "mataKuliah",
        decodedNamaMataKuliah,
        "Pertemuan",
        id
      );
      await setDoc(refPertemuan, { topic: value }, { merge: true });

      setTopics((prev) =>
        prev.map((t) => (t.id === id ? { ...t, topic: value } : t))
      );
      setNewTopicMap((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error("Gagal tambah topik:", err);
    }
  };

  const handleCreateAttendance = async (id) => {
    try {
      const absensiRef = collection(
        db,
        "mataKuliah",
        decodedNamaMataKuliah,
        "Pertemuan",
        id,
        "Absensi"
      );
      const now = new Date();
      const waktu = `${now.getDate().toString().padStart(2, "0")}/${(
        now.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${now.getFullYear()} ${now
        .getHours()
        .toString()
        .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const newDoc = await addDoc(absensiRef, {
        isAvailable: true,
        date: waktu,
      });
      const idAbsensi = newDoc.id;

      await setDoc(
        doc(db, "mataKuliah", decodedNamaMataKuliah, "Pertemuan", id),
        { idAbsensi },
        { merge: true }
      );

      await fetchCourseData();
    } catch (err) {
      console.error("Gagal tambah presensi:", err);
    }
  };

  const fetchAttendanceData = useCallback(
    async (pertemuanId, idAbsensi) => {
      try {
        const mahasiswaRef = collection(
          db,
          "mataKuliah",
          decodedNamaMataKuliah,
          "Pertemuan",
          pertemuanId,
          "Absensi",
          idAbsensi,
          "Mahasiswa"
        );

        const snapshot = await getDocs(mahasiswaRef);
        const storage = getStorage();

        const data = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const nim = doc.id;
            const mhsData = doc.data();
            let faceUrl = "";

            try {
              const imgRef = ref(
                storage,
                `faces/${decodedNamaMataKuliah}/${pertemuanId}/${nim}_face.png`
              );
              faceUrl = await getDownloadURL(imgRef);
            } catch {
              faceUrl = "/default-face.png";
            }

            return { nim, ...mhsData, faceUrl };
          })
        );

        setAttendanceData((prev) => ({ ...prev, [pertemuanId]: data }));
      } catch (err) {
        console.error("Fetch presensi gagal:", err);
      }
    },
    [decodedNamaMataKuliah]
  );

  useEffect(() => {
    if (isAuthChecked) fetchCourseData();
  }, [isAuthChecked]);

  useEffect(() => {
    topics.forEach((t) => {
      if (t.idAbsensi) fetchAttendanceData(t.id, t.idAbsensi);
    });
  }, [topics, fetchAttendanceData]);

  if (!isAuthChecked) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">LeADS: Dashboard Dosen</h1>
          <nav className="space-x-4">
            <button onClick={() => router.push("/dosen/home")}>Home</button>
            <button>Faculty</button>
            <button>Announcements</button>
            <button>Helpdesk</button>
          </nav>
        </div>
      </header>

      <main className="flex-1 p-8">
        {loading ? (
          <p>Loading...</p>
        ) : courseData ? (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">
              {decodedNamaMataKuliah.toUpperCase()}
            </h2>

            <section className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleCreatePertemuan}
                  className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                  + Tambah Pertemuan
                </button>
              </div>

              {topics.map((t, idx) => (
                <div
                  key={t.id}
                  className="mb-6 p-4 bg-gray-100 rounded-lg shadow"
                >
                  <div className="flex justify-between">
                    <h4 className="font-semibold">
                      {t.id} {t.topic && `| ${t.topic}`}
                    </h4>
                  </div>

                  {!t.topic && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        placeholder="Masukkan topik"
                        className="border rounded p-2"
                        value={newTopicMap[t.id] || ""}
                        onChange={(e) =>
                          setNewTopicMap((prev) => ({
                            ...prev,
                            [t.id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        onClick={() => handleAddTopic(t.id, newTopicMap[t.id])}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                      >
                        Tambah Topik
                      </button>
                    </div>
                  )}

                  {t.topic && (
                    <div className="mt-3">
                      <button
                        onClick={() => handleCreateAttendance(t.id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        + Tambah Presensi
                      </button>
                      {t.idAbsensi && (
                        <p className="mt-2 text-gray-600">
                          ID Presensi: <b>{t.idAbsensi}</b>
                        </p>
                      )}
                    </div>
                  )}

                  {attendanceData[t.id] && (
                    <div className="mt-4">
                      <h5 className="text-md font-semibold mb-2">
                        Mahasiswa Hadir:
                      </h5>
                      {attendanceData[t.id].length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {attendanceData[t.id].map((mhs) => (
                            <div
                            key={mhs.nim}
                            className="flex items-center bg-white p-4 rounded-xl shadow-md border border-gray-200"
                          >
                            <Image
                              src={mhs.faceUrl}
                              alt={`Foto ${mhs.nim}`}
                              width={100}
                              height={100}
                              className="rounded-full object-cover border border-gray-300"
                            />
                            <div className="ml-6 text-lg">
                              <p className="font-bold text-gray-800">NIM: {mhs.nim}</p>
                              <p className="text-gray-700">Status: <span className="capitalize">{mhs.status}</span></p>
                              <p className="text-gray-600">Waktu: {new Date(mhs.time).toLocaleString("id-ID")}</p>
                            </div>
                          </div>
                          
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          Belum ada mahasiswa hadir.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {error && <p className="text-red-500">{error}</p>}
            </section>
          </div>
        ) : (
          <p>Course tidak ditemukan.</p>
        )}
      </main>
    </div>
  );
};

export default CourseDetailPage;
