// File: frontend/src/components/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../api/authService"; // Chú giả định cái này vẫn hoạt động tốt nha con.

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Luôn nhớ cái này nha con, để trang không bị load lại khi bấm nút
    setError(""); // Xóa lỗi cũ đi trước khi thử đăng nhập mới
    setLoading(true); // Báo cho người dùng biết là đang "bận" rồi

    try {
      const response = await authService.login(email, password);

      if (response.data.token) {
        localStorage.setItem("userToken", response.data.token); // Lưu token vào bộ nhớ cục bộ
        navigate("/"); // Chuyển hướng về trang chính
      } else {
        setError("Không nhận được token. Vui lòng thử lại."); // Báo lỗi rõ ràng hơn
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(errMsg); // Hiển thị lỗi từ server hoặc lỗi mặc định
      console.error("Lỗi đăng nhập:", err.response?.data || err.message); // In lỗi ra console để dễ debug
    } finally {
      setLoading(false); // Dù thành công hay thất bại thì cũng phải bỏ trạng thái "bận" đi
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 bg-fixed bg-no-repeat">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 space-y-8
                      transition transform duration-300 ease-in-out
                      hover:shadow-3xl hover:scale-[1.01]">
        <h2 className="text-5xl font-extrabold text-center text-gray-800 mb-8">
          Đăng Nhập
        </h2>
        {/* Form đăng nhập - Nơi mình bày biện các hộp đựng đồ */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Form group cho Email - Hộp đựng Email */}
          <div>
            {/* Label - Cái nhãn dán tên cho hộp */}
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2">
              Email của bạn:
            </label>
            {/* Input Email - Hộp chính để nhập Email */}
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
              placeholder="ví dụ: ban.la.ai@email.com" // Ví dụ thực tế hơn
            />
          </div>

          {/* Form group cho Mật khẩu - Hộp đựng Mật khẩu */}
          <div>
            {/* Label */}
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2">
              Mật khẩu của bạn:
            </label>
            {/* Input Mật khẩu */}
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:shadow-md
                         disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-gray-100
                         transition duration-200 ease-in-out"
              placeholder="ít nhất 6 ký tự nha..."
            />
          </div>

          {/* Hiển thị lỗi nếu có - Cái đèn báo lỗi */}
          {error && (
            <p className="text-red-600 text-base font-medium italic text-center animate-pulse">
              {error}
            </p>
          )}

          {/* Nút Đăng Nhập - Cánh cửa vào nhà */}
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
              "Đăng Nhập"
            )}
          </button>
        </form>
        {/* Link Đăng ký - Lời mời đến với "khu vườn" mới */}
        {/* mt-8: Khoảng cách lớn hơn từ form. */}
        {/* text-gray-600: Màu chữ xám. */}
        {/* text-base: Kích thước chữ mặc định, dễ đọc. */}
        <p className="mt-8 text-center text-gray-600 text-base">
          Chưa có tài khoản?{" "}
          {/* Link: text-indigo-700: Màu xanh tím đậm hơn cho link. */}
          {/* hover:underline hover:text-indigo-800: Gạch chân và đậm màu khi rê chuột. */}
          {/* font-bold: Chữ in đậm, nổi bật hơn. */}
          {/* transition duration-200 ease-in-out: Hiệu ứng chuyển động mượt mà hơn. */}
          <Link
            to="/register"
            className="text-indigo-700 hover:underline hover:text-indigo-800 font-bold transition duration-200 ease-in-out">
            Đăng ký tại đây
          </Link>
        </p>
      </div>
    </div>
  );
}
