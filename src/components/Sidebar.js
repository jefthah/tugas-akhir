"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import {
  FaUser,
  FaPaperPlane,
  FaChevronRight,
  FaChevronLeft,
  FaSpinner,
  FaTachometerAlt,
  FaUserCircle,
  FaGraduationCap,
  FaEnvelope,
  FaCogs,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Sidebar({ sidebarOpen, handleNavigation }) {
  const [mode, setMode] = useState("main");
  const [userData, setUserData] = useState({ nim: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFacultyClick = () => setMode("faculty");
  const handleBackToMain = () => setMode("main");
  const handleProfileClick = () => setMode("profileMenu");

  const handleLogout = () => {
    setLoading(true);
    Cookies.remove("session_mahasiswa");

    toast.success("Logout sukses!"); // Toast notifikasi
    setTimeout(() => {
      router.push("/mahasiswa/login");
    }, 1500); // kasih delay 1.5 detik biar smooth
  };

  useEffect(() => {
    const sessionData = Cookies.get("session_mahasiswa");
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        if (parsed?.isLoggedIn && parsed?.nim) {
          setUserData({ nim: parsed.nim });
        }
      } catch (error) {
        console.error("Gagal parsing cookie session_mahasiswa:", error);
      }
    }
  }, []);

  return (
    <>
      {/* Toaster untuk menampilkan toast */}
      <Toaster position="top-center" reverseOrder={false} />

      <div
        className={`sidebar absolute top-0 left-0 h-full w-80 bg-black text-white border-r border-gray-700 transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center text-base font-bold py-4 border-b border-gray-700 uppercase bg-gray-800 relative">
          {mode !== "main" && (
            <button
              onClick={handleBackToMain}
              className="absolute left-4 text-white"
            >
              <FaChevronLeft size={18} />
            </button>
          )}
          {mode === "main" ? "Menu" : mode === "faculty" ? "Fakultas" : userData.nim}
        </div>

        {/* Wrapper */}
        <div className="flex flex-col h-full">
          <div className="relative w-full flex-1 overflow-hidden">
            <div
              className={`flex transition-transform duration-300 ${
                mode === "main"
                  ? "translate-x-0"
                  : mode === "faculty"
                  ? "-translate-x-[320px]"
                  : "-translate-x-[640px]"
              }`}
              style={{ width: "960px" }}
            >
              {/* MENU UTAMA */}
              <ul className="w-80 mt-2 overflow-y-auto">
                <li>
                  <button onClick={() => handleNavigation("/")} className="flex justify-between items-center w-full py-3 px-6 text-sm bg-black border-b border-gray-700 hover:bg-gray-800 uppercase">
                    Beranda
                  </button>
                </li>

                <li>
                  <button onClick={handleFacultyClick} className="flex justify-between items-center w-full py-3 px-6 text-sm bg-black border-b border-gray-700 hover:bg-gray-800 uppercase">
                    Fakultas
                    <FaChevronRight size={14} />
                  </button>
                </li>

                <li>
                  <button onClick={() => handleNavigation("/announcements")} className="flex justify-between items-center w-full py-3 px-6 text-sm bg-black border-b border-gray-700 hover:bg-gray-800 uppercase">
                    Pengumuman
                  </button>
                </li>

                <li>
                  <button onClick={() => handleNavigation("/helpdesk")} className="flex justify-between items-center w-full py-3 px-6 text-sm bg-black border-b border-gray-700 hover:bg-gray-800 uppercase">
                    Bantuan
                    <FaChevronRight size={14} />
                  </button>
                </li>

                <li>
                  <button onClick={() => handleNavigation("/language")} className="flex justify-between items-center w-full py-3 px-6 text-sm bg-black border-b border-gray-700 hover:bg-gray-800 uppercase">
                    Bahasa Indonesia (ID)
                    <FaChevronRight size={14} />
                  </button>
                </li>

                {/* Profile / Login */}
                {!userData.nim ? (
                  <li>
                    <button onClick={() => handleNavigation("/mahasiswa/login")} className="flex items-center gap-2 w-full py-3 px-6 text-sm bg-black border-b border-gray-700 hover:bg-gray-800 uppercase">
                      <FaUser size={14} />
                      Login
                    </button>
                  </li>
                ) : (
                  <li>
                    <button onClick={handleProfileClick} className="flex justify-between items-center w-full py-3 px-6 text-sm bg-black border-b border-gray-700 hover:bg-gray-800 uppercase">
                      <span>{userData.nim}</span>
                      <FaChevronRight size={14} />
                    </button>
                  </li>
                )}
              </ul>

              {/* MENU FAKULTAS */}
              <ul className="w-80 mt-2 overflow-y-auto">
                {/* fakultas list di sini */}
              </ul>

              {/* PROFILE MENU */}
              <ul className="w-80 mt-2 overflow-y-auto">
                <li><button onClick={() => handleNavigation("/dashboard")} className="flex items-center gap-2 w-full py-3 px-6 text-sm border-b border-gray-700 hover:bg-gray-800 uppercase"><FaTachometerAlt /> Dashboard</button></li>
                <li><button onClick={() => handleNavigation("/profile")} className="flex items-center gap-2 w-full py-3 px-6 text-sm border-b border-gray-700 hover:bg-gray-800 uppercase"><FaUserCircle /> Profile</button></li>
                <li><button onClick={() => handleNavigation("/grades")} className="flex items-center gap-2 w-full py-3 px-6 text-sm border-b border-gray-700 hover:bg-gray-800 uppercase"><FaGraduationCap /> Grades</button></li>
                <li><button onClick={() => handleNavigation("/messages")} className="flex items-center gap-2 w-full py-3 px-6 text-sm border-b border-gray-700 hover:bg-gray-800 uppercase"><FaEnvelope /> Messages</button></li>
                <li><button onClick={() => handleNavigation("/preferences")} className="flex items-center gap-2 w-full py-3 px-6 text-sm border-b border-gray-700 hover:bg-gray-800 uppercase"><FaCogs /> Preferences</button></li>

                {/* LOG OUT */}
                <li>
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="flex items-center gap-2 w-full py-3 px-6 text-sm text-red-400 border-b border-gray-700 hover:bg-gray-800 uppercase"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Logging Out...
                      </>
                    ) : (
                      <>
                        <FaSignOutAlt />
                        Log Out
                      </>
                    )}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-700 flex items-center gap-2 text-xs text-gray-400">
            <FaPaperPlane size={12} />
            leads@upnvj.ac.id
          </div>
        </div>
      </div>
    </>
  );
}
