"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import NavbarMahasiswa from "@/components/NavbarMahasiswa"; // ✅ Import NavbarMahasiswa
import SidebarMahasiswa from "@/components/SidebarMahasiswa"; // ✅ Import SidebarMahasiswa
import { auth, db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Cookies from "js-cookie";
import {
  FaTachometerAlt,
  FaUserGraduate,
  FaStar,
  FaEnvelope,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

const colors = [
  "bg-pink-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-purple-500",
];

const MahasiswaDashboard = () => {
  const router = useRouter();
  const pathname = usePathname();
  const nim = pathname.split("/")[2];
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [recentCourse, setRecentCourse] = useState(null);
  const [otherCourses, setOtherCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false); // Tambahan sidebar state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const sessionData = JSON.parse(
          Cookies.get("session_mahasiswa") || null
        );
        if (
          sessionData &&
          sessionData.isLoggedIn &&
          sessionData.role === "mahasiswa"
        ) {
          setRole("mahasiswa");
          setIsAuthChecked(true);
        } else {
          router.push("/mahasiswa/login");
        }
      } else {
        router.push("/mahasiswa/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "mataKuliah"));
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          mataKuliah: doc.id,
          progress: Math.floor(Math.random() * 100),
        }));

        setRecentCourse(list[0]);
        setOtherCourses(list.slice(1));
      } catch (error) {
        console.error("Error fetching mata kuliah:", error);
      }
      setLoading(false);
    };

    if (isAuthChecked && role === "mahasiswa") {
      fetchCourses();
    }
  }, [isAuthChecked, role]);

  const handleLogout = () => {
    Cookies.remove("session_mahasiswa");
    router.push("/mahasiswa/login");
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return isAuthChecked && role === "mahasiswa" ? (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Sidebar */}
      <SidebarMahasiswa
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
        userData={{ name: "Nama Mahasiswa", email: "email@domain.com" }}
      />

      {/* Konten utama */}
      <div
        onClick={() => sidebarOpen && setSidebarOpen(false)}
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-80" : "ml-0"
        }`}
      >
        {/* Navbar */}
        <NavbarMahasiswa
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Layout utama */}
        <div className="flex flex-1 pt-20">
          {/* Sidebar untuk Desktop */}
          <aside className="hidden lg:flex flex-col w-64 p-4 bg-white shadow-md border-r">
            <h2 className="text-lg font-bold mb-6 text-gray-700">Start</h2>
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => router.push("/mahasiswa/home")}
                className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded text-gray-700"
              >
                <FaTachometerAlt />
                <span>Dashboard</span>
              </button>
              <button className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded text-gray-700">
                <FaUserGraduate />
                <span>Profile</span>
              </button>
              <button className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded text-gray-700">
                <FaStar />
                <span>Grades</span>
              </button>
              <button className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded text-gray-700">
                <FaEnvelope />
                <span>Messages</span>
              </button>
              <button className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded text-gray-700">
                <FaCog />
                <span>Preferences</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded text-red-500"
              >
                <FaSignOutAlt />
                <span>Log out</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-gray-50 p-6">
            {/* Recently accessed course */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Recently accessed courses
              </h2>
              {recentCourse && (
                <div className="bg-gray-100 p-4 rounded-md shadow-sm flex items-start w-full mb-4">
                  <div className="flex-shrink-0 w-32 h-32 bg-pink-500 rounded-md mr-4" />
                  <div className="flex-grow">
                    <div className="font-semibold text-gray-800">
                      <p>S1 Informatika</p>
                      <p>2024 Ganjil | {recentCourse.mataKuliah}</p>
                    </div>
                    <div className="mb-1 mt-2">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Published
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      Mata Kuliah {recentCourse.mataKuliah} Kurikulum 511.2024
                    </p>

                    <div className="relative w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${recentCourse.progress}%` }}
                      ></div>
                      <span className="absolute right-2 top-0 text-xs text-gray-800">
                        {recentCourse.progress}% complete
                      </span>
                    </div>

                    <button
                      className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-4 rounded"
                      onClick={() =>
                        router.push(
                          `/mahasiswa/mataKuliah/${encodeURIComponent(
                            recentCourse.mataKuliah
                          )}`
                        )
                      }
                    >
                      View
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Other courses */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {otherCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="bg-gray-100 p-4 rounded-md shadow-sm flex items-start"
                  >
                    <div
                      className={`flex-shrink-0 w-32 h-32 ${
                        colors[index % colors.length]
                      } rounded-md mr-4`}
                    />
                    <div className="flex-grow">
                      <div className="font-semibold text-gray-800">
                        <p>S1 Informatika</p>
                        <p>2024 Ganjil | {course.mataKuliah}</p>
                      </div>
                      <div className="mb-1 mt-2">
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Published
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        Mata Kuliah {course.mataKuliah} Kurikulum 511.2024
                      </p>

                      <button
                        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-4 rounded"
                        onClick={() =>
                          router.push(
                            `/mahasiswa/mataKuliah/${encodeURIComponent(
                              course.mataKuliah
                            )}`
                          )
                        }
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  ) : null;
};

export default MahasiswaDashboard;
