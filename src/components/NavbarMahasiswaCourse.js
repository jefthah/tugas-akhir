"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaBars,
  FaEyeSlash,
  FaChartBar,
  FaComments,
  FaCog,
  FaUserCircle,
} from "react-icons/fa";
import Cookies from "js-cookie";

export default function NavbarMahasiswaCourse({ sidebarOpen, setSidebarOpen }) {
  const router = useRouter();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({ name: "", email: "" });

  useEffect(() => {
    const sessionData = Cookies.get("session_mahasiswa");
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      if (parsed?.isLoggedIn && parsed?.role === "mahasiswa") {
        setIsLoggedIn(true);
        setUserData({
          name: parsed.name || "",
          email: parsed.email || "",
        });
      }
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("session_mahasiswa");
    router.push("/mahasiswa/login");
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-transparent">
        <div className="flex items-center justify-between px-4 md:px-8 py-5 text-white">
          {/* Logo */}
          <div className="flex items-center space-x-10">
            <Image
              src="/images/logo/leads_poppins.png"
              alt="LeADS Logo"
              width={260}
              height={40}
              priority
            />
            {/* Menu */}
            <nav className="hidden xl:flex space-x-6 font-light text-[18px] ml-6">
              <button
                onClick={() => router.push("/")}
                className="hover:underline"
              >
                Home
              </button>
              <button
                onClick={() => router.push("/faculty")}
                className="hover:underline"
              >
                Faculty
              </button>
              <button
                onClick={() => router.push("/announcements")}
                className="hover:underline"
              >
                Announcements
              </button>
              <button
                onClick={() => router.push("/helpdesk")}
                className="hover:underline"
              >
                Helpdesk
              </button>
              <div className="relative">
                <button
                  onClick={() => {
                    setLanguageDropdownOpen(!languageDropdownOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className="flex items-center hover:underline"
                >
                  English (EN) <span className="ml-1">▼</span>
                </button>
                {languageDropdownOpen && (
                  <div className="absolute bg-white shadow-md rounded mt-2 w-40 text-gray-700 right-0 z-50">
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                      English (EN)
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                      Indonesian (ID)
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {isLoggedIn && (
              <div className="hidden xl:flex items-center space-x-4 relative">
                <div className="bg-white/20 p-2 rounded-full hover:bg-white/30 cursor-pointer">
                  <FaEyeSlash size={18} />
                </div>
                <div className="relative">
                  <div className="bg-white/20 p-2 rounded-full hover:bg-white/30 cursor-pointer">
                    <FaChartBar size={18} />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full px-1">
                    384
                  </span>
                </div>
                <div className="bg-white/20 p-2 rounded-full hover:bg-white/30 cursor-pointer">
                  <FaComments size={18} />
                </div>
                <div className="bg-white/20 p-2 rounded-full hover:bg-white/30 cursor-pointer">
                  <FaCog size={18} />
                </div>
                <div
                  className="bg-white/20 p-2 rounded-full hover:bg-white/30 cursor-pointer"
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setLanguageDropdownOpen(false);
                  }}
                >
                  <FaUserCircle size={24} />
                </div>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-14 w-64 bg-white rounded-lg shadow-lg p-4 z-50">
                    <div className="flex flex-col items-center mb-4">
                      <FaUserCircle size={50} className="text-gray-500 mb-2" />
                      <p className="font-semibold text-gray-800 text-center">
                        {userData.name || "Unknown User"}
                      </p>
                      <p className="text-gray-500 text-sm text-center">
                        {userData.email || "unknown@email.com"}
                      </p>
                    </div>
                    <div className="border-t my-2"></div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => router.push("/mahasiswa/home")}
                        className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded transition"
                      >
                        <FaChartBar className="text-gray-600" />
                        <span className="text-gray-800">Dashboard</span>
                      </button>
                      <button
                        onClick={() => router.push("/profile")}
                        className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded transition"
                      >
                        <FaUserCircle className="text-gray-600" />
                        <span className="text-gray-800">Profile</span>
                      </button>
                      <button
                        onClick={() => router.push("/grades")}
                        className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded transition"
                      >
                        <FaComments className="text-gray-600" />
                        <span className="text-gray-800">Grades</span>
                      </button>
                      <button
                        onClick={() => router.push("/messages")}
                        className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded transition"
                      >
                        <FaComments className="text-gray-600" />
                        <span className="text-gray-800">Messages</span>
                      </button>
                      <button
                        onClick={() => router.push("/preferences")}
                        className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded transition"
                      >
                        <FaCog className="text-gray-600" />
                        <span className="text-gray-800">Preferences</span>
                      </button>
                      <div className="border-t my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 text-red-500 hover:bg-red-100 p-2 rounded transition"
                      >
                        <FaEyeSlash className="text-red-500" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              className="xl:hidden text-3xl"
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(true);
              }}
            >
              <FaBars />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
