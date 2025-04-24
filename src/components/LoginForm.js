"use client";

import { useRouter } from "next/navigation";

export default function LoginForm({
  nim,
  setNim,
  password,
  setPassword,
  handleLogin,
  error,
  nimExists,
}) {
  const router = useRouter();

  return (
    <form
      onSubmit={handleLogin}
      className="bg-white p-10 rounded-lg w-full max-w-xl mx-auto mt-16"
    >
      <h2 className="text-center text-2xl font-bold mb-8">Login to your account</h2>

      {/* Input NIM */}
      <div className="mb-2">
        <input
          type="text"
          placeholder="Nama pengguna"
          value={nim}
          onChange={(e) => setNim(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50 text-black text-lg"
          required
        />
      </div>

      {/* Jika NIM tidak ditemukan */}
      {nimExists === false && (
        <p className="text-sm text-red-600 mt-1">
          NIM tidak ditemukan.{" "}
          <button
            type="button"
            onClick={() => router.push("/mahasiswa/registration")}
            className="text-blue-600 hover:underline font-semibold"
          >
            Daftar sekarang
          </button>
        </p>
      )}

      {/* Input Password */}
      <div className="mb-6 mt-4">
        <input
          type="password"
          placeholder="Kata sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-6 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50 text-black text-lg"
          required
        />
      </div>

      {/* Checkbox dan forgot */}
      <div className="flex items-center justify-between mb-8">
        <label className="flex items-center text-sm text-gray-600">
          <input type="checkbox" className="mr-2" />
          Ingat username
        </label>
        <a href="#" className="text-sm text-blue-500 hover:underline">
          Forgot Password?
        </a>
      </div>

      {error && (
        <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
      )}

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
  );
}
