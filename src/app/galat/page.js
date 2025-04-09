"use client"; // Menandai komponen ini sebagai Client Component

import { useState } from "react"; // Import useState untuk mengatur sidebar
import NavbarHome from "@/components/NavbarHome"; // Import NavbarHome
import Footer from "@/components/Footer"; // Import Footer

export default function GalatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Menambahkan state untuk sidebar

  // Fungsi untuk menutup sidebar ketika mengklik di luar sidebar
  const handlePageClick = (event) => {
    if (sidebarOpen && !event.target.closest(".sidebar") && !event.target.closest(".sidebar-button")) {
      setSidebarOpen(false); // Menutup sidebar jika area di luar sidebar diklik
    }
  };

  return (
    <div className="min-h-screen flex flex-col" onClick={handlePageClick}>
      {/* Navbar */}
      <NavbarHome
        sidebarOpen={sidebarOpen} // Meneruskan sidebarOpen ke NavbarHome
        setSidebarOpen={setSidebarOpen} // Meneruskan setSidebarOpen ke NavbarHome
      />

      {/* Main content */}
      <div className="flex-1 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 pt-20 sm:pt-28 flex flex-col justify-center items-center">
        <div className="text-white text-3xl sm:text-4xl font-bold mt-12 text-center">
          LEADS UPN VETERAN JAKARTA
        </div>
        <div className="text-white text-sm sm:text-lg font-light mt-2 text-center">
          Beranda / Kategori tidak diketahui
        </div>

        {/* Galat message */}
        <div className="bg-red-100 text-red-700 p-4 rounded-md mt-8 max-w-lg text-center">
          <p className="font-medium">Kategori tidak diketahui</p>
          <p>Informasi selanjutnya mengenai galat ini</p>
        </div>

        {/* Lanjutkan Button */}
        <a href="/" className="mt-8 px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-200">
          Lanjutkan
        </a>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
