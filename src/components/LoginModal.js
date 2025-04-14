"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { app } from "@/lib/firebase";
import Cookies from "js-cookie"; // <-- tambah ini

export default function LoginModal({ isOpen, onClose }) {
  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  const convertToEmail = (nim) => `${nim}@mahasiswa.upnvj.ac.id`;

  const fetchUserDetails = async (nim) => {
    try {
      const userRef = doc(getFirestore(app), "mahasiswa", nim);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Simpan ke Cookies
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

        router.push(`/mahasiswa/home`);
      } else {
        console.log("No user data found for NIM:", nim);
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const email = convertToEmail(nim);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await fetchUserDetails(nim);
    } catch (error) {
      console.error("Error during login:", error);
      setError("Login gagal. Periksa kembali NIM dan kata sandi Anda.");
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 bg-black flex justify-center items-center z-50
  ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
      onClick={handleClose}
    >
      <div
        className={`bg-white px-10 py-8 rounded-xl w-[500px] relative shadow-xl transition-transform
    ${isClosing ? "animate-scaleOut" : "animate-scaleIn"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-[-20px] right-[-20px] w-10 h-10 flex items-center justify-center bg-blue-600 text-white 
      rounded-full hover:bg-blue-800 transition"
          onClick={handleClose}
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Login to your account
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <input
              type="text"
              placeholder="Masukkan NIM"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 text-black"
              required
            />
          </div>

          <div className="mb-5">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 text-black"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center space-x-2 text-sm">
              <input type="checkbox" className="form-checkbox text-blue-600" />
              <span>Ingat username</span>
            </label>
            <a href="#" className="text-sm text-red-500 hover:underline">
              Lupa kata sandi?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-3 rounded-md hover:bg-blue-800 transition duration-300"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
