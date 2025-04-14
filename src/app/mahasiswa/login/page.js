"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import NavbarHome from "@/components/NavbarHome";
import Footer from "@/components/Footer";
import Cookies from "js-cookie";

export default function MahasiswaLoginPage() {
  const router = useRouter();
  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ nim: "", name: "", email: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const fetchUserDetails = useCallback(async (nim) => {
    try {
      const userRef = doc(getFirestore(app), "mahasiswa", nim);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          nim: userData.nim,
          name: userData.name,
          email: userData.email,
        });

        Cookies.set(
          "session_mahasiswa",
          JSON.stringify({
            isLoggedIn: true,
            nim: userData.nim,
            name: userData.name,
            email: userData.email,
            role: userData.role,
          })
        );
      } else {
        console.log("User data not found!");
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const email = `${nim}@mahasiswa.upnvj.ac.id`;
      await signInWithEmailAndPassword(auth, email, password);
      await fetchUserDetails(nim);
      setIsLoggedIn(true);
      router.replace(`/mahasiswa/home`);
    } catch (error) {
      console.error("Error during login:", error);
      setError("Login gagal. Periksa kembali NIM dan password Anda.");
    }
  };

  const handleLogout = () => {
    Cookies.remove("session_mahasiswa");
    setIsLoggedIn(false);
    setUser({ nim: "", name: "", email: "" });
    router.replace("/mahasiswa/login");
  };

  useEffect(() => {
    const sessionData = JSON.parse(Cookies.get("session_mahasiswa") || "null");
    if (sessionData?.isLoggedIn) {
      setIsLoggedIn(true);
      setUser({
        nim: sessionData.nim,
        name: sessionData.name,
        email: sessionData.email,
      });
    }
    setCheckingSession(false);
  }, []);

  const handlePageClick = (event) => {
    if (sidebarOpen && !event.target.closest(".sidebar") && !event.target.closest(".sidebar-button")) {
      setSidebarOpen(false);
    }
  };

  if (checkingSession) return null; // Jangan render apa-apa sebelum cek session selesai

  return (
    <div className="min-h-screen" onClick={handlePageClick}>
      <NavbarHome
        isLoggedIn={isLoggedIn}
        handleLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userData={user}
      />

      <div className="h-[38vh] bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 pt-20 sm:pt-28 flex flex-col justify-center items-center">
        <div className="text-white text-3xl sm:text-4xl font-bold mt-12 text-center">
          LeADS UPN Veteran Jakarta
        </div>
        <div className="text-white text-sm sm:text-lg font-light mt-2 text-center">
          Beranda / {isLoggedIn ? "Sudah Masuk" : "Masuk ke situs"}
        </div>
      </div>

      {/* Konten utama */}
      <main className="flex flex-col items-center justify-center pb-10 bg-white min-h-[40vh]">
  {!isLoggedIn ? (
    // Jika belum login, tampilkan form login
    <form
      onSubmit={handleLogin}
      className="bg-white p-10 rounded-lg w-full max-w-xl mx-auto mt-16"
    >
      <h2 className="text-center text-2xl font-bold mb-8">Login to your account</h2>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Nama pengguna"
          value={nim}
          onChange={(e) => setNim(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50 text-black text-lg"
          required
        />
      </div>
      <div className="mb-6">
        <input
          type="password"
          placeholder="Kata sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-6 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50 text-black text-lg"
          required
        />
      </div>
      <div className="flex items-center justify-between mb-8">
        <label className="flex items-center text-sm text-gray-600">
          <input type="checkbox" className="mr-2" />
          Ingat username
        </label>
        <a href="#" className="text-sm text-blue-500 hover:underline">
          Forgot Password?
        </a>
      </div>
      {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md text-lg font-semibold transition"
      >
        Masuk
      </button>
      <div className="mt-8 text-center text-xs text-gray-500">
        Kuki harus diaktifkan pada peramban Anda
      </div>
    </form>
  ) : (
    // Jika sudah login, tampilkan card confirm
    <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 max-w-md w-full mx-auto mt-16">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm</h2>
      <p className="text-gray-600 text-sm mb-6">
        You are already logged in as <span className="font-bold">{user.nim} {user.name}</span>, you need to log out before logging in as different user.
      </p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleLogout}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md"
        >
          Log out
        </button>
        <button
          onClick={() => router.push(`/mahasiswa/home`)}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md"
        >
          Cancel
        </button>
      </div>
    </div>
  )}
</main>


      <Footer />
    </div>
  );
}
