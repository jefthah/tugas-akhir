"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Sidebar from "./Sidebar";
import LoginModal from "./LoginModal";
import {
  FaEyeSlash,
  FaChartBar,
  FaComments,
  FaCog,
  FaUserCircle,
} from "react-icons/fa";
import Cookies from "js-cookie";

export default function NavbarHome({ sidebarOpen, setSidebarOpen }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleNavigation = (path) => {
    router.push(path);
    setSidebarOpen(false);
    setDropdownOpen(false);
  };

  const handleCloseSidebar = (e) => {
    if (sidebarOpen && !e.target.closest(".sidebar")) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cek login status dari cookies
  useEffect(() => {
    const sessionData = Cookies.get("session_mahasiswa");
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      if (parsed?.isLoggedIn && parsed?.role === "mahasiswa") {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    } else {
      setLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("session_mahasiswa");
    router.push("/mahasiswa/login");
  };

  return (
    <>
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div
        className="flex transition-all duration-300"
        onClick={handleCloseSidebar}
      >
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          handleNavigation={handleNavigation}
          isLoggedIn={loggedIn}
          handleLogout={handleLogout}
        />

        <div className="flex-1">
          <header
            className={`fixed w-full top-0 z-30 transition-all duration-500 ${
              isScrolled
                ? "bg-white shadow-md translate-y-0"
                : "bg-transparent border-b border-white/30 translate-y-0"
            } ${isScrolled ? "animate-slideDown" : ""}`}
          >
            <div className="flex justify-between items-center px-4 md:px-8 py-4 relative">
              {/* Logo dan Menu */}
              <div className="flex items-center space-x-4 md:space-x-16">
                <Image
                  src={
                    isScrolled
                      ? "/images/logo/leads_poppins_dark.png"
                      : "/images/logo/leads_poppins.png"
                  }
                  alt="LeADS Logo"
                  width={280}
                  height={60}
                  priority
                />
                <nav
                  className={`hidden lg:flex space-x-4 text-[16px] transition-colors duration-300 ${
                    isScrolled ? "text-black" : "text-white"
                  }`}
                >
                  <button
                    onClick={() => handleNavigation("/")}
                    className="hover:underline py-2 px-4"
                  >
                    Beranda
                  </button>
                  <button
                    onClick={() => handleNavigation("/faculty")}
                    className="hover:underline py-2 px-4"
                  >
                    Fakultas
                  </button>
                  <button
                    onClick={() => handleNavigation("/announcements")}
                    className="hover:underline py-2 px-4"
                  >
                    Pengumuman
                  </button>
                  <button
                    onClick={() => handleNavigation("/helpdesk")}
                    className="hover:underline py-2 px-4"
                  >
                    Bantuan
                  </button>
                  <button
                    onClick={() => handleNavigation("/language")}
                    className="hover:underline py-2 px-4"
                  >
                    Bahasa (ID)
                  </button>
                </nav>
              </div>

              {/* Tombol + Icon Bar */}
              <div className="flex items-center space-x-4 ml-auto relative">
                {/* Mobile hamburger */}
                <button
                  className={`lg:hidden text-3xl ${
                    isScrolled ? "text-black" : "text-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSidebarOpen(!sidebarOpen);
                  }}
                >
                  ☰
                </button>

                {/* Icon Bar hanya kalau sudah login */}
                {loggedIn && (
                  <div className="hidden lg:flex items-center space-x-3 text-white relative">
                    <div className="bg-white/20 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/30 cursor-pointer">
                      <FaEyeSlash size={18} />
                    </div>
                    <div className="relative">
                      <div className="bg-white/20 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/30 cursor-pointer">
                        <FaChartBar size={18} />
                      </div>
                      <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full px-1">
                        384
                      </span>
                    </div>
                    <div className="bg-white/20 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/30 cursor-pointer">
                      <FaComments size={18} />
                    </div>
                    <div className="bg-white/20 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/30 cursor-pointer">
                      <FaCog size={18} />
                    </div>

                    {/* Avatar */}
                    <div
                      className="bg-white/20 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/30 cursor-pointer"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <FaUserCircle size={22} />
                    </div>

                    {/* Dropdown */}
                    {dropdownOpen && (
                      <div className="absolute right-0 top-14 w-64 bg-white rounded-lg shadow-lg p-4 z-50">
                        {/* Profile info */}
                        <div className="flex flex-col items-center mb-4">
                          <FaUserCircle
                            size={50}
                            className="text-gray-500 mb-2"
                          />
                          <p className="text-center font-semibold text-gray-800">
                            2110511131 JEFTA SUPRAJA
                          </p>
                          <p className="text-center text-sm text-gray-500">
                            jefta.supraja@gmail.com
                          </p>
                        </div>
                        <div className="border-t border-gray-200 my-2"></div>

                        {/* Menu List */}
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handleNavigation("/mahasiswa/home")}
                            className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded transition"
                          >
                            <FaChartBar className="text-gray-600" />
                            <span className="text-gray-800 font-medium">
                              Dashboard
                            </span>
                          </button>
                          <button
                            onClick={() => handleNavigation("/profile")}
                            className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded transition"
                          >
                            <FaUserCircle className="text-gray-600" />
                            <span className="text-gray-800 font-medium">
                              Profile
                            </span>
                          </button>
                          <button
                            onClick={() => handleNavigation("/grades")}
                            className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded transition"
                          >
                            <FaComments className="text-gray-600" />
                            <span className="text-gray-800 font-medium">
                              Grades
                            </span>
                          </button>
                          <button
                            onClick={() => handleNavigation("/messages")}
                            className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded transition"
                          >
                            <FaComments className="text-gray-600" />
                            <span className="text-gray-800 font-medium">
                              Messages
                            </span>
                          </button>
                          <button
                            onClick={() => handleNavigation("/preferences")}
                            className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded transition"
                          >
                            <FaCog className="text-gray-600" />
                            <span className="text-gray-800 font-medium">
                              Preferences
                            </span>
                          </button>

                          <div className="border-t border-gray-200 my-2"></div>

                          {/* Logout */}
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 text-red-600 hover:bg-red-100 p-2 rounded transition"
                          >
                            <FaEyeSlash className="text-red-500" />
                            <span className="font-medium">Log out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Kalau belum login tombol Masuk/Daftar */}
                {!loggedIn && (
                  <button
                    className={`hidden lg:block font-semibold ${
                      isScrolled ? "text-black" : "text-white"
                    } hover:underline transition`}
                    onClick={() => setIsModalOpen(true)}
                  >
                    Masuk/Daftar
                  </button>
                )}
              </div>
            </div>
          </header>
        </div>
      </div>

      {/* Custom Animation */}
      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 1s ease forwards;
        }
      `}</style>
    </>
  );
}
