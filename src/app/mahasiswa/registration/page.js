"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "@/lib/firebase";
import NavbarHome from "@/components/NavbarHome";
import Footer from "@/components/Footer";
import Cookies from "js-cookie";

export default function MahasiswaRegisterPage() {
  const router = useRouter();
  const db = getFirestore(app);
  const auth = getAuth(app);

  const [nim, setNim] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nimTaken, setNimTaken] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const checkNim = async () => {
      if (nim.length === 10) {
        const ref = doc(db, "mahasiswa", nim);
        const snap = await getDoc(ref);
        setNimTaken(snap.exists());
      } else {
        setNimTaken(false);
      }
    };

    const delay = setTimeout(() => checkNim(), 300);
    return () => clearTimeout(delay);
  }, [nim, db]);

  const generateEmail = () => {
    if (nim.length === 10) {
      setEmail(`${nim}@mahasiswa.upnvj.ac.id`);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!nim || !name || !email || !password) {
      setSubmitError("Semua field wajib diisi.");
      return;
    }

    if (nimTaken) {
      setSubmitError("NIM sudah terdaftar. Silakan login.");
      return;
    }

    try {
      // Firebase Authentication
      await createUserWithEmailAndPassword(auth, email, password);

      // Firestore Mahasiswa
      await setDoc(doc(db, "mahasiswa", nim), {
        nim,
        name,
        email,
        role: "mahasiswa",
      });

      // Simpan session
      Cookies.set("session_mahasiswa", JSON.stringify({
        isLoggedIn: true,
        nim,
        name,
        email,
      }));
      

      router.push("/mahasiswa/face-registration");
    } catch (err) {
      console.error("Gagal menyimpan data:", err.message);
      setSubmitError("Terjadi kesalahan saat menyimpan. Coba lagi.");
    }
  };

  return (
    <div className="min-h-screen">
      <NavbarHome
        isLoggedIn={false}
        handleLogout={() => {}}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userData={{}}
      />

      <div className="h-[38vh] bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 pt-20 sm:pt-28 flex flex-col justify-center items-center">
        <h1 className="text-white text-3xl sm:text-4xl font-bold mt-12 text-center">
          LeADS UPN Veteran Jakarta
        </h1>
        <p className="text-white text-sm sm:text-lg font-light mt-2 text-center">
          Beranda / Daftar Mahasiswa
        </p>
      </div>

      <main className="flex flex-col items-center justify-center pb-10 bg-white min-h-[40vh]">
        <form onSubmit={handleRegister} className="bg-white p-10 rounded-lg w-full max-w-xl mx-auto mt-16">
          <h2 className="text-center text-2xl font-bold mb-8">Register</h2>

          {/* NIM */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="NIM (10 digit)"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-black text-lg"
              maxLength={10}
              minLength={10} // Tambahan opsional
              required
            />
          </div>

          {/* NIM Terdaftar */}
          {nimTaken && (
            <p className="text-sm text-red-600 mb-4">
              NIM sudah terdaftar.{" "}
              <a href="/mahasiswa/login" className="text-blue-600 hover:underline font-medium">
                Silakan login
              </a>.
            </p>
          )}

          {/* Nama */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={nimTaken}
              className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-black text-lg"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4 flex gap-2 items-center">
            <input
              type="text"
              placeholder="Email"
              value={email}
              readOnly
              disabled={nimTaken}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-black text-lg"
            />
            <button
              type="button"
              onClick={generateEmail}
              disabled={nimTaken}
              className="px-4 py-2 text-sm rounded-md text-white bg-blue-500 hover:bg-blue-600"
            >
              Generate Email
            </button>
          </div>

          {/* Password */}
          <div className="mb-6">
            <input
              type="password"
              placeholder="Password (minimal 6 digit angka)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={nimTaken}
              pattern="[0-9]{6,}"
              title="Password harus angka minimal 6 digit"
              className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-black text-lg"
              required
            />
          </div>

          {/* Error */}
          {submitError && (
            <p className="text-red-600 text-sm text-center mb-4">
              {submitError}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md text-lg font-semibold"
          >
            Next
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
