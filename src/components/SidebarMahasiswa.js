"use client";

import { useRouter } from "next/navigation";
import { FaChevronRight, FaUserCircle } from "react-icons/fa";

export default function SidebarMahasiswa({ sidebarOpen, setSidebarOpen, handleLogout, userData }) {
  const router = useRouter();

  const navigate = (path) => {
    router.push(path);
    setSidebarOpen(false); // Menutup sidebar setelah navigasi
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-black text-white z-40 transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* HEADER */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 text-center">
        <p className="font-bold text-white text-lg">MENU</p>
      </div>

      {/* NAVIGATION */}
      <nav className="flex flex-col p-2 space-y-1">
        <button
          onClick={() => navigate("/mahasiswa/home")}
          className="flex justify-between items-center w-full text-left px-4 py-3 hover:bg-gray-700"
        >
          HOME
        </button>
        <button
          onClick={() => navigate("/faculty")}
          className="flex justify-between items-center w-full text-left px-4 py-3 hover:bg-gray-700"
        >
          FACULTY <FaChevronRight />
        </button>
        <button
          onClick={() => navigate("/announcements")}
          className="flex justify-between items-center w-full text-left px-4 py-3 hover:bg-gray-700"
        >
          ANNOUNCEMENTS
        </button>
        <button
          onClick={() => navigate("/helpdesk")}
          className="flex justify-between items-center w-full text-left px-4 py-3 hover:bg-gray-700"
        >
          HELPDESK <FaChevronRight />
        </button>
        <button
          className="flex justify-between items-center w-full text-left px-4 py-3 hover:bg-gray-700"
        >
          ENGLISH (EN) <FaChevronRight />
        </button>
        <button
          onClick={() => navigate("/navigation")}
          className="flex justify-between items-center w-full text-left px-4 py-3 hover:bg-gray-700"
        >
          NAVIGATION <FaChevronRight />
        </button>
      </nav>

      {/* DIVIDER */}
      <div className="border-t border-gray-700 my-2"></div>

      {/* USER AREA */}
      <div 
        className="flex items-center justify-between px-4 py-3 hover:bg-gray-700 cursor-pointer"
        onClick={handleLogout}
      >
        <div className="flex flex-col">
          {/* TAMPILKAN NIM */}
          <span className="text-sm">
            {userData?.nim ? userData.nim : "NIM Tidak Ditemukan"}
          </span>
        </div>
        <FaUserCircle size={20} />
      </div>
    </div>
  );
}
