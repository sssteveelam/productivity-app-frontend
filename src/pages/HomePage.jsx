// File: frontend/src/components/HomePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState();
  const navigate = useNavigate();

  const [currentQuote, setCurrentQuote] = useState({ text: "", author: "" });
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      navigate("/login");
    }

    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/login");
  };

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  };

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
  }, [currentTime]); // Changed dependency to currentTime to ensure re-evaluation on each second (or any time update)

  useEffect(() => {
    const fetchQuote = async () => {
      setQuoteLoading(true);
      setQuoteError(null);

      try {
        const response = await fetch("http://localhost:5001/api/quote/random");

        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.q && data.a) {
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 text-center">
      <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold text-gray-900 drop-shadow-lg my-8">
        {formatTime(currentTime)}
      </div>

      <div className="text-2xl sm:text-3xl md:text-4xl text-gray-700 font-medium mb-8 drop-shadow-sm">
        {greeting}
      </div>

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-l-8 border-indigo-600 min-h-[150px] flex flex-col justify-center items-center transition-all duration-500 ease-in-out hover:shadow-2xl hover:scale-[1.01] cursor-pointer">
        {quoteLoading && (
          <div className="flex items-center justify-center text-center text-gray-600 italic animate-pulse">
            <svg
              className="animate-spin h-6 w-6 mr-3 text-indigo-500"
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
            Đang tải trích dẫn truyền cảm hứng...
          </div>
        )}
        {quoteError && (
          <p className="text-center text-red-600 font-semibold text-lg">
            {quoteError}
          </p>
        )}
        {!quoteLoading && !quoteError && currentQuote.text && (
          <>
            <p className="text-lg sm:text-xl italic leading-relaxed mb-4 text-gray-800 font-serif">
              "{currentQuote.text}"
            </p>
            {currentQuote.author && (
              <p className="text-base sm:text-lg font-semibold text-right text-indigo-700 w-full pr-2">
                - {currentQuote.author}
              </p>
            )}
          </>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="mt-12 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                   transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl active:scale-100 active:bg-red-800">
        Đăng Xuất
      </button>
    </div>
  );
}
