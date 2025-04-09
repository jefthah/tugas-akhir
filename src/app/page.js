// app/page.js

"use client"

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import NavbarHome from "@/components/NavbarHome"; // Import NavbarHome
import Slider from "@/components/Slider"; // Import Slider

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ nim: "", name: "", email: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const db = getFirestore(app);

  // useEffect untuk menghapus atribut cz-shortcut-listen
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
    router.push("/"); // Redirect ke halaman utama
  };

  // Fungsi untuk menutup sidebar ketika mengklik di luar sidebar
  const handlePageClick = (event) => {
    if (sidebarOpen && !event.target.closest(".sidebar")) {
      setSidebarOpen(false); // Menutup sidebar jika area di luar sidebar diklik
    }
  };

  return (
    <div className="min-h-screen relative" onClick={handlePageClick}>
      {/* Background Image from Slider */}
      <Slider />

      {/* Navbar */}
      <NavbarHome 
        isLoggedIn={isLoggedIn} 
        handleLogout={handleLogout} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
    </div>
  );
}
