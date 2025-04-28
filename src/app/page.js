"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import NavbarHome from "@/components/NavbarHome";
import Slider from "@/components/Slider";
import Sidebar from "@/components/Sidebar";

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ nim: "", name: "", email: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const db = getFirestore(app);

  useEffect(() => {
    if (document.body.hasAttribute("cz-shortcut-listen")) {
      document.body.removeAttribute("cz-shortcut-listen");
    }
  }, []);

  const fetchUserDetails = useCallback(async (nim) => {
    try {
      const userDoc = await getDoc(doc(db, "mahasiswa", nim));
      if (userDoc.exists()) {
        setUser({
          nim,
          name: userDoc.data().nama,
          email: userDoc.data().email,
        });
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  }, [db]);

  useEffect(() => {
    const sessionData = JSON.parse(sessionStorage.getItem("session_mahasiswa"));
    if (sessionData?.isLoggedIn && sessionData.nimOrNip) {
      setIsLoggedIn(true);
      fetchUserDetails(sessionData.nimOrNip);
    }
  }, [fetchUserDetails]);

  const handleLogout = () => {
    sessionStorage.removeItem("session_mahasiswa");
    setIsLoggedIn(false);
    setUser({ nim: "", name: "", email: "" });
    router.push("/");
  };

  const handleNavigation = (path) => {
    setSidebarOpen(false);
    router.push(path);
  };

  // 🆕 Close sidebar automatically if resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // 1024px = Tailwind 'lg'
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        handleNavigation={handleNavigation}
        isLoggedIn={isLoggedIn}
        handleLogout={handleLogout}
      />

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Wrapper Konten Utama */}
      <div className="relative z-30 flex flex-col min-h-screen">
        <NavbarHome
          isLoggedIn={isLoggedIn}
          handleLogout={handleLogout}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1">
          <Slider />
          {/* Tambahkan konten lain di sini */}
        </main>
      </div>
    </div>
  );
}
