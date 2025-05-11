import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userToken"); // Xóa token
    navigate("/login");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Chào mừng đến với Ứng dụng Năng suất!</h1>
      {/* {userEmail && <p>Bạn đã đăng nhập với email: {userEmail}</p>} */}
      <p>
        Đây là trang chủ của bạn. Các tính năng chính sẽ được phát triển ở đây.
      </p>
      <button
        onClick={handleLogout}
        style={{
          padding: "10px 15px",
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "20px",
        }}>
        Đăng Xuất
      </button>
    </div>
  );
}
