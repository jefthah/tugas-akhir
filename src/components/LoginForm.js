"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { app } from "@/lib/firebase";
import Cookies from "js-cookie";

export default function LoginForm() {
  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();

  const convertToEmail = (nim) => `${nim}@mahasiswa.upnvj.ac.id`;

  const fetchUserDetails = async (nim) => {
    try {
      const userRef = doc(getFirestore(app), "mahasiswa", nim);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          nim: userData.nim,
          name: userData.name,
          email: userData.email,
          role: userData.role,
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

        console.log("User data saved to cookies:", userData);
      } else {
        console.log("No user data found for NIM:", nim);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const email = convertToEmail(nim);
      await signInWithEmailAndPassword(auth, email, password);
      await fetchUserDetails(nim);
      router.push(`/mahasiswa/home`);
    } catch (error) {
      console.error("Error during login:", error);
      setError("Login gagal. Periksa kembali NIM dan kata sandi Anda.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-10 rounded-lg w-full max-w-xl mx-auto mt-16 "
    >
      {/* Judul */}
      <h2 className="text-center text-2xl font-bold mb-8">Login to your account</h2>

      {/* Input NIM */}
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

      {/* Input Password */}
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

      {/* Checkbox dan Forgot Password */}
      <div className="flex items-center justify-between mb-8">
        <label className="flex items-center text-sm text-gray-600">
          <input type="checkbox" className="mr-2" />
          Ingat username
        </label>
        <a href="#" className="text-sm text-blue-500 hover:underline">
          Forgot Password?
        </a>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

      {/* Tombol Login */}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md text-lg font-semibold transition"
      >
        Masuk
      </button>

      {/* Informasi Cookies */}
      <div className="mt-8 text-center text-xs text-gray-500">
        Kuki harus diaktifkan pada peramban Anda
      </div>
    </form>
  );
}
