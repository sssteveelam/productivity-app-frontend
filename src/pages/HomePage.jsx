import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState();
  const navigate = useNavigate();

  // State cho trích dẫn, loading và error
  const [currentQuote, setCurrentQuote] = useState({ text: "", author: "" });
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState(null);

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

  // --- CẬP NHẬT EFFECT ĐỂ LẤY TRÍCH DẪN TỪ API ---

  useEffect(() => {
    const fetchQuote = async () => {
      setQuoteLoading(true);
      setQuoteError(null);

      try {
        // Gọi API của ZenQuotes
        const response = await fetch("http://localhost:5001/api/quote/random");

        // Kiểm tra xem request có thành công không
        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.q && data.a) {
          // Kiểm tra các thuộc tính cần thiết q (quote) và a (author)
          setCurrentQuote({ text: data.q, author: data.a });
        } else {
          throw new Error("Dữ liệu trích dẫn không hợp lệ từ server.");
        }
      } catch (error) {
        console.error("Không thể tải trích dẫn từ API:", error);
        setQuoteError(
          "Rất tiếc, không thể tải trích dẫn lúc này. Vui lòng thử lại sau."
        );

        setCurrentQuote({
          text: "Nơi nào có ý chí, nơi đó có con đường.",
          author: "Ngạn ngữ",
        });
      } finally {
        setQuoteLoading(false);
      }
    };

    fetchQuote();
  }, []);

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

      {/* --- HIỂN THỊ TRÍCH DẪN, LOADING, HOẶC ERROR --- */}
      <div
        style={{
          minHeight: "100px", // Đặt chiều cao tối thiểu để layout không bị giật khi nội dung thay đổi
          fontStyle: "italic",
          margin: "0 20px 40px 20px",
          color: "#666",
          maxWidth: "700px",
          padding: "15px",
          borderLeft: "3px solid #007bff",
          backgroundColor: "#f8f9fa",
        }}>
        {quoteLoading && <p>Đang tải trích dẫn...</p>}
        {quoteError && <p style={{ color: "red" }}>{quoteError}</p>}
        {!quoteLoading && !quoteError && currentQuote.text && (
          <>
            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
                marginBottom: "10px",
                lineHeight: "1.6",
              }}>
              "{currentQuote.text}"
            </p>
            {currentQuote.author && (
              <p
                style={{
                  fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                  textAlign: "right",
                  color: "#007bff",
                }}>
                - {currentQuote.author}
              </p>
            )}
          </>
        )}
      </div>

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
