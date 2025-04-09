"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import LoginForm from "@/components/LoginForm";
import NavbarHome from "@/components/NavbarHome"; // Import NavbarHome
import Footer from "@/components/Footer";
import Cookies from "js-cookie";
 // Import Footer

export default function MahasiswaLoginPage() {
  const router = useRouter();
  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ nim: "", name: "", email: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchUserDetails = useCallback(async (nim) => {
    try {
      const userDoc = await getDoc(doc(getFirestore(app), "mahasiswa", nim));
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
  }, []);

  useEffect(() => {
    const sessionData = JSON.parse(Cookies.get("session_mahasiswa") || null);
    if (sessionData?.isLoggedIn && sessionData.nimOrNip) {
      setIsLoggedIn(true);
      fetchUserDetails(sessionData.nimOrNip);
    }
  }, [fetchUserDetails]);
  

  const convertToEmail = (nim) => {
    return `${nim}@mahasiswa.upnvj.ac.id`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const email = convertToEmail(nim);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      router.push(`/mahasiswa/${nim}/home`);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error during login:", error);
      setError("Login gagal. Periksa kembali NIM dan kata sandi Anda.");
    }
  };

  // Fungsi untuk menutup sidebar ketika mengklik di luar sidebar
  const handlePageClick = (event) => {
    if (sidebarOpen && !event.target.closest(".sidebar") && !event.target.closest(".sidebar-button")) {
      setSidebarOpen(false); // Menutup sidebar jika area di luar sidebar diklik
    }
  };

  return (
    <div className="min-h-screen" onClick={handlePageClick}>
      {/* Navbar always on top */}
      <NavbarHome
        isLoggedIn={isLoggedIn}
        handleLogout={() => {
          Cookies.remove("session_mahasiswa");
          setIsLoggedIn(false);
          setUser({ nim: "", name: "", email: "" });
          router.push("/mahasiswa/login");
        }}
        
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      {/* Gradient at the top */}
      <div className="h-[38vh] bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 pt-20 sm:pt-28 flex flex-col justify-center items-center">
        {/* LeADS Title in the center */}
        <div className="text-white text-3xl sm:text-4xl font-bold mt-12 text-center">
          LeADS UPN Veteran Jakarta
        </div>
        {/* Subheading with thinner font */}
        <div className="text-white text-sm sm:text-lg font-light mt-2 text-center">
          Beranda / Masuk ke situs
        </div>
      </div>

      {/* Login content below the gradient */}
      <main className="flex flex-col items-center justify-center pb-10 bg-white">
        <LoginForm
          nim={nim}
          setNim={setNim}
          password={password}
          setPassword={setPassword}
          handleLogin={handleLogin}
          error={error}
        />
      </main>

      {/* Footer */}
      <Footer /> {/* Gunakan Footer yang telah dipisahkan */}
    </div>
  );
}
