// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../api/authService";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(email, password, username);
      setMessage(
        response.data.message ||
          "Đăng ký thành công! Bạn có thể đăng nhập ngay."
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";

      setError(errMsg);
      console.error("Lỗi đăng ký:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 bg-fixed bg-no-repeat">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 space-y-8 transition transform duration-300 ease-in-out hover:shadow-3xl hover:scale-[1.01]">
        <h2 className="text-5xl font-extrabold text-center text-gray-800 mb-8">
          Đăng Ký
        </h2>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2">
              Email của bạn:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:shadow-md
                         disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-gray-100
                         transition duration-200 ease-in-out"
              placeholder="ví dụ: ban.la.ai@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-gray-700 mb-2">
              Tên người dùng:
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength="6"
              disabled={loading}
              className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:shadow-md
                         disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-gray-100
                         transition duration-200 ease-in-out"
              placeholder="Tên đăng nhập của bạn"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2">
              Mật khẩu:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              disabled={loading}
              className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:shadow-md
                         disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-gray-100
                         transition duration-200 ease-in-out"
              placeholder="ít nhất 6 ký tự nha..."
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-700 mb-2">
              Xác nhận mật khẩu:
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:shadow-md
                         disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-gray-100
                         transition duration-200 ease-in-out"
              placeholder="nhập lại mật khẩu"
            />
          </div>

          {error && (
            <p className="text-red-600 text-base font-medium italic text-center animate-pulse">
              {error}
            </p>
          )}
          {message && (
            <p className="text-green-600 text-base font-medium italic text-center animate-pulse">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-xl shadow-indigo-500/50
                       text-xl font-extrabold text-white bg-indigo-700 hover:bg-indigo-800
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-indigo-500
                       transition transform duration-300 ease-in-out
                       hover:scale-105 hover:shadow-2xl active:scale-100 active:bg-indigo-900">
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              "Đăng Ký"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600 text-base">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-indigo-700 hover:underline hover:text-indigo-800 font-bold transition duration-200 ease-in-out">
            Đăng nhập tại đây
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
