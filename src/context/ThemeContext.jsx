// src/context/ThemeContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  Children,
} from "react";
// Tạo Context
export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Hàm để lấy theme ban đầu: ưu tiên localStorage, sau đó là cài đặt hệ thống, cuối cùng là 'light'
  const getInitialTheme = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedPrefs = window.localStorage.getItem("color-theme");
      if (typeof storedPrefs === "string") {
        return storedPrefs; // Trả về 'light' hoặc 'dark'
      }

      // Kiểm tra cài đặt prefers-color-scheme của hệ thống.
      const userMedia = window.matchMedia("(prefers-color-scheme: dark)");

      if (userMedia.matches) {
        return "dark";
      }
    }

    return "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement; // thẻ html

    const isDark = theme === "dark";

    // Xóa class không đúng và thêm class đúng
    root.classList.remove(isDark ? "light" : "dark");
    root.classList.add(theme);

    // Xóa class không đúng và thêm class đúng.
    localStorage.setItem("color-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Sử dụng useMemo để tối ưu, tránh tạo lại object value không cần thiết
  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
