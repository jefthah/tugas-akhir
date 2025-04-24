"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth, app } from "@/lib/firebase";
import NavbarHome from "@/components/NavbarHome";
import Footer from "@/components/Footer";
import Cookies from "js-cookie";
import LoginForm from "@/components/LoginForm"; // Import komponen

export default function MahasiswaLoginPage() {
  const router = useRouter();
  const db = getFirestore(app);

  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [nimExists, setNimExists] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [user, setUser] = useState({
    nim: "",
    name: "",
    email: "",
  });

  const fetchUserDetails = useCallback(async (nim) => {
    try {
      const ref = doc(db, "mahasiswa", nim);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setUser({
          nim: data.nim,
          name: data.name,
          email: data.email,
        });

        Cookies.set(
          "session_mahasiswa",
          JSON.stringify({
            isLoggedIn: true,
            nim: data.nim,
            name: data.name,
            email: data.email,
            role: data.role,
          })
        );
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [db]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const email = `${nim}@mahasiswa.upnvj.ac.id`;
      await signInWithEmailAndPassword(auth, email, password);
      await fetchUserDetails(nim);
      setIsLoggedIn(true);
      router.replace(`/mahasiswa/home`);
    } catch (err) {
      console.error("Login error:", err);
      setError("Login gagal. Periksa kembali NIM dan password Anda.");
    }
  };

  useEffect(() => {
    if (!nim.trim()) {
      setNimExists(null);
      return;
    }

    const check = async () => {
      try {
        const ref = doc(db, "mahasiswa", nim);
        const snap = await getDoc(ref);
        setNimExists(snap.exists());
      } catch (err) {
        console.error("Check NIM:", err);
      }
    };

    const delay = setTimeout(() => check(), 300);
    return () => clearTimeout(delay);
  }, [nim, db]);

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

      if (!sessionData.name) {
        fetchUserDetails(sessionData.nim);
      }
    }
    setCheckingSession(false);
  }, [fetchUserDetails]);

  const handlePageClick = (e) => {
    if (
      sidebarOpen &&
      !e.target.closest(".sidebar") &&
      !e.target.closest(".sidebar-button")
    ) {
      setSidebarOpen(false);
    }
  };

  if (checkingSession) return null;

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

      <main className="flex flex-col items-center justify-center pb-10 bg-white min-h-[40vh]">
        {!isLoggedIn ? (
          <LoginForm
            nim={nim}
            setNim={setNim}
            password={password}
            setPassword={setPassword}
            handleLogin={handleLogin}
            error={error}
            nimExists={nimExists}
          />
        ) : (
          <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 max-w-md w-full mx-auto mt-16">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm</h2>
            <p className="text-gray-600 text-sm mb-6">
              You are already logged in as{" "}
              <span className="font-bold">
                {user.nim} {user.name}
              </span>
              , you need to log out before logging in as different user.
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
