import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      navigate("/login");
    }

    // --- LOGIC CHO ĐỒNG HỒ ---
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userToken"); // Xóa token
    navigate("/login");
  };

  // format time
  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  };

  // get Welcome message
  const getGreetingMessage = (hour) => {
    if (hour >= 5 && hour < 12) {
      return `Chào buổi sáng!`;
    } else if (hour >= 12 && hour < 18) {
      return `Chúc bạn một buổi chiều làm việc hiệu quả!`;
    } else if (hour >= 18 && hour < 22) {
      return `Chào buổi tối!`;
    } else {
      return `Đã khuya rồi, nghỉ ngơi thôi bạn ơi!`;
    }
  };

  useEffect(() => {
    const currentHour = currentTime.getHours();
    setGreeting(getGreetingMessage(currentHour));
  }, [currentTime.getHours()]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // Căn giữa các item theo chiều ngang
        justifyContent: "center", // Căn giữa các item theo chiều dọc (nếu HomePage chiếm toàn bộ chiều cao)
        minHeight: "80vh", // Giúp căn giữa theo chiều dọc tốt hơn
        padding: "20px",
        textAlign: "center", // Căn giữa text bên trong các phần tử con
      }}>
      {/* 1. Đồng hồ */}
      <div
        style={{
          fontSize: "clamp(3rem, 10vw, 6rem)",
          fontWeight: "bold",
          margin: "20px 0 30px 0",
          color: "#333",
        }}>
        {formatTime(currentTime)}
      </div>

      {/* 2. Lời chào */}
      <div
        style={{
          fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
          margin: "0 0 30px 0",
          color: "#555",
        }}>
        {greeting}
      </div>

      <h1>Chào mừng đến với Ứng dụng Năng suất!</h1>
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
          marginTop: "30px",
        }}>
        Đăng Xuất
      </button>
    </div>
  );
}
