import React from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggleButton from "./ThemeToggleButton"; // Mình giả định component này bạn đã xử lý dark mode riêng nha

export default function Navbar() {
  const navigate = useNavigate();

  // Kiểm tra xem người dùng đã đăng nhập hay chưa dựa trên token trong localStorage
  const isLoggedIn = !!localStorage.getItem("userToken");

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/login");
  };

  return (
    <header className="p-3 sm:p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg sticky top-0 z-50 transition-colors duration-300 ease-in-out">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo và Navigation chính */}
        <nav className="flex items-center space-x-4 sm:space-x-6">
          <Link
            to="/"
            className="text-xl sm:text-2xl font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded-md">
            FocusApp
          </Link>
          {isLoggedIn && (
            <Link
              to="/todo"
              className="px-3 py-2 text-base sm:text-lg font-medium text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-slate-700/60 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900">
              Công Việc
            </Link>
          )}
        </nav>

        {/* Nút Đăng nhập/Đăng xuất và Nút chuyển Theme */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-red-600 hover:text-white dark:text-red-400 dark:hover:text-white border border-red-500 dark:border-red-400 rounded-lg hover:bg-red-500 dark:hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95">
              Đăng Xuất
            </button>
          ) : (
            <nav className="flex items-center space-x-2 sm:space-x-3">
              <Link
                to="/login"
                className="px-3 py-2 text-base sm:text-lg font-medium text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700/60 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900">
                Đăng Nhập
              </Link>
              <Link
                to="/register"
                className="px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95">
                Đăng Ký
              </Link>
            </nav>
          )}
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}
