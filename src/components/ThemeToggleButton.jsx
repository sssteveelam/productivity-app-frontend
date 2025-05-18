// src/components/ThemeToggleButton.jsx
import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext"; // Import Context

// Bạn có thể dùng icon từ thư viện như react-icons nếu muốn
import { FaSun, FaMoon } from "react-icons/fa";

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  if (!theme) return null;

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 
                  ${
                    theme === "light"
                      ? "bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-400"
                      : "bg-slate-700 hover:bg-slate-600 text-yellow-400 focus:ring-slate-500"
                  }`}
      aria-label={
        theme === "light" ? "Chuyển sang chế độ tối" : "Chuyển sang chế độ sáng"
      }
      title={
        theme === "light" ? "Chuyển sang chế độ tối" : "Chuyển sang chế độ sáng"
      }>
      {theme === "light" ? (
        // <FaMoon className="w-5 h-5" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        // <FaSun className="w-5 h-5" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggleButton;
