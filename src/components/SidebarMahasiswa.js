"use client";

import { useRouter } from "next/navigation";
import { FaChevronRight, FaUserCircle, FaArrowLeft } from "react-icons/fa";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export default function SidebarMahasiswa({ sidebarOpen, setSidebarOpen, handleLogout, userData: propUserData }) {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [activeMenu, setActiveMenu] = useState("main");

  useEffect(() => {
    if (propUserData && propUserData.nim) {
      setUserData(propUserData);
    } else {
      const session = Cookies.get("session_mahasiswa");
      if (session) {
        const parsed = JSON.parse(session);
        setUserData({
          nim: parsed.nim,
          name: parsed.name,
          email: parsed.email,
        });
      }
    }
  }, [propUserData]);

  const navigate = (path) => {
    router.push(path);
    setSidebarOpen(false);
  };

  const handleOpenSubmenu = (menu) => {
    setActiveMenu(menu);
  };

  const handleBackToMain = () => {
    setActiveMenu("main");
  };

  return (
    <div className={`fixed top-0 left-0 h-full w-80 bg-black text-white z-40 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex flex-col h-full">

        {/* HEADER */}
        <div className="p-4 bg-[#2c2c2c] border-b border-gray-700 text-center flex items-center justify-center relative">
          {activeMenu !== "main" && (
            <button onClick={handleBackToMain} className="absolute left-4">
              <FaArrowLeft />
            </button>
          )}
          <p className="font-bold text-white text-base">{activeMenu === "main" ? "MENU" : activeMenu.toUpperCase()}</p>
        </div>

        {/* MENU AREA */}
        <div className="relative overflow-hidden flex-1">
          <div className="relative w-full h-full">
            {/* Main Menu */}
            <div className={`absolute top-0 left-0 w-full h-full transition-transform duration-300 ease-in-out ${activeMenu === "main" ? "translate-x-0" : "-translate-x-full"}`}>
              <nav className="flex flex-col divide-y divide-gray-800">
                <button onClick={() => navigate("/mahasiswa/home")} className="flex justify-between items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-700">
                  HOME
                </button>
                <button onClick={() => handleOpenSubmenu("faculty")} className="flex justify-between items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-700">
                  FACULTY <FaChevronRight size={14} />
                </button>
                <button onClick={() => navigate("/announcements")} className="flex justify-between items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-700">
                  ANNOUNCEMENTS
                </button>
                <button onClick={() => handleOpenSubmenu("helpdesk")} className="flex justify-between items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-700">
                  HELPDESK <FaChevronRight size={14} />
                </button>
                <button onClick={() => handleOpenSubmenu("language")} className="flex justify-between items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-700">
                  ENGLISH (EN) <FaChevronRight size={14} />
                </button>
                <button onClick={() => navigate("/navigation")} className="flex justify-between items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-700">
                  NAVIGATION <FaChevronRight size={14} />
                </button>

                {/* PROFILE as menu item */}
                <button onClick={handleLogout} className="flex justify-between items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-700">
                  <span>{userData?.nim ? userData.nim : "NIM Tidak Ditemukan"}</span>
                  <FaUserCircle size={20} />
                </button>
              </nav>
            </div>

            {/* Faculty Submenu */}
            <div className={`absolute top-0 left-0 w-full h-full transition-transform duration-300 ease-in-out ${activeMenu === "faculty" ? "translate-x-0" : "translate-x-full"}`}>
              <nav className="flex flex-col divide-y divide-gray-800">
                <button className="px-4 py-3 text-sm text-left hover:bg-gray-700">ECONOMICS AND BUSINESS</button>
                <button className="px-4 py-3 text-sm text-left hover:bg-gray-700">MEDICINE</button>
                <button className="px-4 py-3 text-sm text-left hover:bg-gray-700">ENGINEERING</button>
                <button className="px-4 py-3 text-sm text-left hover:bg-gray-700">SOCIAL SCIENCE</button>
                <button className="px-4 py-3 text-sm text-left hover:bg-gray-700">COMPUTER SCIENCE</button>
                <button className="px-4 py-3 text-sm text-left hover:bg-gray-700">LAW</button>
                <button className="px-4 py-3 text-sm text-left hover:bg-gray-700">HEALTH SCIENCE</button>
                <button className="px-4 py-3 text-sm text-left hover:bg-gray-700">UNIVERSITY COURSES</button>
                <button className="px-4 py-3 text-sm text-left hover:bg-gray-700">ALL COURSE</button>
              </nav>
            </div>

            {/* Helpdesk Submenu */}
            <div className={`absolute top-0 left-0 w-full h-full transition-transform duration-300 ease-in-out ${activeMenu === "helpdesk" ? "translate-x-0" : "translate-x-full"}`}>
              <nav className="flex flex-col divide-y divide-gray-800">
                <button className="px-4 py-3 text-sm text-left hover:bg-gray-700">FAQ</button>
                <button className="px-4 py-3 text-sm text-left hover:bg-gray-700">CONTACT SUPPORT</button>
              </nav>
            </div>

            {/* Language Submenu */}
            <div className={`absolute top-0 left-0 w-full h-full transition-transform duration-300 ease-in-out ${activeMenu === "language" ? "translate-x-0" : "translate-x-full"}`}>
              <nav className="flex flex-col divide-y divide-gray-800">
                <button className="px-4 py-3 text-sm text-left hover:bg-gray-700">ENGLISH (EN)</button>
                <button className="px-4 py-3 text-sm text-left hover:bg-gray-700">INDONESIAN (ID)</button>
              </nav>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
