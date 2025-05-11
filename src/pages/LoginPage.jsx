import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../api/authService";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(email, password);

      if (response.data.token) {
        localStorage.setItem("userToken", response.data.token);
        navigate("/");
      } else {
        setError("Không nhận được token. Vui lòng thử lại.");
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(errMsg);
      console.error("Lỗi đăng nhập:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}>
      <h2>Đăng Nhập</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="password">Mật khẩu:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}>
          {loading ? "Đang xử lý..." : "Đăng Nhập"}
        </button>
      </form>
      <p style={{ marginTop: "15px", textAlign: "center" }}>
        Chưa có tài khoản? <Link to="/register">Đăng ký tại đây</Link>
      </p>
    </div>
  );
}
