"use client";

export default function Sidebar({ sidebarOpen, setSidebarOpen, handleNavigation, isLoggedIn, handleLogout }) {
  return (
    <div
      className={`sidebar fixed top-0 left-0 h-full w-3/4 bg-black text-white z-50 border-r border-gray-600 transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:-translate-x-full`}
      onClick={(e) => e.stopPropagation()} // Prevents click event from bubbling up
    >
      <div className="text-center text-lg font-bold py-4 border-b pb-4 border-gray-600 bg-gray-900">
        MENU
      </div>
      <ul className="mt-4 space-y-2">
        <li>
          <button
            className="w-full text-left py-4 pl-4 bg-black hover:bg-gray-700 border-b border-gray-600"
            onClick={() => handleNavigation("/")}
          >
            🏠 Beranda
          </button>
        </li>
        <li>
          <button
            className="w-full text-left py-4 pl-4 bg-black hover:bg-gray-700 border-b border-gray-600"
            onClick={() => handleNavigation("/faculty")}
          >
            🎓 Fakultas
          </button>
          {/* Hover untuk membuka dropdown */}
          <div className="relative group">
            <ul
              className={`absolute bg-white text-black w-60 top-full left-0 mt-2 space-y-2 p-2 rounded-lg shadow-lg group-hover:block hidden`}
            >
              {/* Dropdown items */}
              <li>
                <button
                  className="w-full text-left py-2 px-4 hover:bg-gray-200"
                  onClick={() => handleNavigation("/faculty/department1")}
                >
                  Ekonomi dan Bisnis
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left py-2 px-4 hover:bg-gray-200"
                  onClick={() => handleNavigation("/faculty/department2")}
                >
                  Kedokteran
                </button>
              </li>
              {/* Add more dropdown items as needed */}
            </ul>
          </div>
        </li>
        <li>
          <button
            className="w-full text-left py-4 pl-4 bg-black hover:bg-gray-700 border-b border-gray-600"
            onClick={() => handleNavigation("/announcements")}
          >
            📢 Pengumuman
          </button>
        </li>
        <li>
          <button
            className="w-full text-left py-4 pl-4 bg-black hover:bg-gray-700 border-b border-gray-600"
            onClick={() => handleNavigation("/helpdesk")}
          >
            🛠️ Bantuan
          </button>
        </li>
        {/* Language & Login/Logout */}
        <li>
          <button
            className="w-full text-left py-4 pl-4 bg-black hover:bg-gray-700 border-b border-gray-600"
            onClick={() => handleNavigation("/language")}
          >
            🌍 Bahasa (ID)
          </button>
        </li>
        {!isLoggedIn ? (
          <li>
            <button
              className="w-full text-left py-4 pl-4 bg-black hover:bg-gray-700 border-b border-gray-600"
              onClick={() => handleNavigation("/mahasiswa/login")}
            >
              🔑 Masuk
            </button>
          </li>
        ) : (
          <li>
            <button
              className="w-full text-left py-4 pl-4 bg-black hover:bg-gray-700 text-red-500 border-b border-gray-600"
              onClick={handleLogout}
            >
              🚪 Keluar
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
