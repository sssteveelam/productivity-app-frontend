// File: frontend/src/components/HomePage.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import mainLogo from "../../public/icons/mainLogo.png"; // Logo của bạn

import {
  Cog6ToothIcon,
  SpeakerWaveIcon,
  ChartBarIcon,
  ListBulletIcon,
  ArrowsPointingOutIcon,
  HomeIcon, // Dùng cho nút quay về Pomodoro từ Ambient
  LightBulbIcon,
  SparklesIcon, // Dùng cho nút chuyển sang Ambient
  ArrowRightOnRectangleIcon, // Icon cho nút Đăng xuất
  MoonIcon, // Icon cho Dark mode (ví dụ)
  SunIcon, // Icon cho Light mode (ví dụ)
} from "@heroicons/react/24/outline";
// import PomodoroTimer from "../components/PomodoroTimer"; // Bạn có thể tích hợp PomodoroTimer ở đây nếu muốn
import { ThemeContext } from "../context/ThemeContext"; // Giả sử bạn có context này để đổi theme
import AmbientTimer from "../components/AmbientTimer";

function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

  const [currentQuote, setCurrentQuote] = useState({
    text: "Difficult doesn't mean impossible. It simply means that you have to work hard.",
    author: "Unknown",
  });
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState(null);
  const [pageMode, setPageMode] = useState("pomodoro"); // 'pomodoro' hoặc 'ambient'

  const navigate = useNavigate();

  const { theme, toggleTheme } = useContext(ThemeContext); // Lấy theme và hàm toggleTheme

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
    }

    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/login");
  };

  const formatLargeDisplayTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const getGreetingMessage = (hour) => {
    if (hour >= 5 && hour < 12) return `Chào buổi sáng, bạn của tôi!`;
    if (hour >= 12 && hour < 18) return `Buổi chiều năng suất nhé!`;
    if (hour >= 18 && hour < 22) return `Buổi tối tốt lành!`;
    return `Đã khuya rồi, nghỉ ngơi thôi nào!`;
  };

  useEffect(() => {
    const currentHour = currentTime.getHours();
    setGreeting(getGreetingMessage(currentHour));
  }, [currentTime]);

  useEffect(() => {
    const fetchQuote = async () => {
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        const response = await fetch("http://localhost:5001/api/quote/random");
        if (!response.ok)
          throw new Error(`Lỗi HTTP! Status: ${response.status}`);
        const data = await response.json();
        if (data && data.q && data.a) {
          setCurrentQuote({ text: data.q, author: data.a });
        } else {
          throw new Error("Dữ liệu trích dẫn không hợp lệ.");
        }
      } catch (error) {
        console.error("Không thể tải trích dẫn:", error);
        setQuoteError("Không thể tải trích dẫn.");
        setCurrentQuote({
          text: "Nơi nào có ý chí, nơi đó có con đường.",
          author: "Ngạn ngữ",
        });
      } finally {
        setQuoteLoading(false);
      }
    };

    fetchQuote();
    const quoteIntervalId = setInterval(fetchQuote, 15 * 60 * 1000); // 15 phút
    return () => clearInterval(quoteIntervalId);
  }, []);

  const togglePageMode = (targetMode) => {
    setPageMode(targetMode);
  };

  // THAY THẾ BẰNG ĐƯỜNG DẪN ẢNH CỦA BẠN CHO AMBIENT MODE
  const ambientBgImage =
    "https://source.unsplash.com/random/1920x1080/?nature,calm"; // Ví dụ ảnh ngẫu nhiên

  // Danh sách các nút action ở footer
  const mainActionButtons = [
    {
      title: "Thống kê",
      icon: ChartBarIcon,
      action: () => alert("Thống kê (Sắp có!)"),
      disabled: true,
    },
    {
      title: "To-Do List",
      icon: ListBulletIcon,
      action: () => navigate("/todo"),
    },
    {
      title: "Cài đặt",
      icon: Cog6ToothIcon,
      action: () => alert("Cài đặt (Sắp có!)"),
      disabled: true,
    },
    {
      title: "Đăng xuất",
      icon: ArrowRightOnRectangleIcon,
      action: handleLogout,
    },
  ];

  const utilityButtons = [
    {
      title: "Âm thanh môi trường",
      icon: SpeakerWaveIcon,
      action: () => alert("Âm thanh (Sắp có!)"),
      disabled: true,
    },
    {
      title: "Toàn màn hình",
      icon: ArrowsPointingOutIcon,
      action: () => alert("Toàn màn hình (Sắp có!)"),
      disabled: true,
    },
    {
      title: "Ý tưởng",
      icon: LightBulbIcon,
      action: () => alert("Ý tưởng (Sắp có!)"),
      disabled: true,
    },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col antialiased transition-all duration-500 ease-in-out
                  ${theme === "dark" ? "dark" : ""}
                  ${
                    pageMode === "pomodoro"
                      ? "bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 justify-between p-4 sm:p-6"
                      : "justify-start text-white" // Ambient mode sẽ có text màu trắng mặc định, có thể cần điều chỉnh tùy ảnh nền
                  }`}
      style={
        pageMode === "ambient"
          ? {
              backgroundImage: `url(${ambientBgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
            }
          : {}
      }>
      {/* Header: Chỉ hiển thị ở Pomodoro Mode */}
      {pageMode === "pomodoro" && (
        <header className="w-full flex justify-between items-center z-10 mb-4 md:mb-8">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}>
            <img
              src={mainLogo}
              alt="FocusApp Logo"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-md"
            />
            {/* <span className="text-2xl sm:text-3xl font-bold text-pink-500 dark:text-pink-400">FocusApp</span> */}
          </div>

          {/* Quote */}
          <div className="text-right max-w-xs sm:max-w-sm md:max-w-md text-slate-600 dark:text-slate-400 group">
            {quoteLoading && (
              <p className="text-xs italic">Đang tìm cảm hứng...</p>
            )}
            {quoteError && !quoteLoading && (
              <p className="text-xs italic text-amber-500">{quoteError}</p>
            )}
            {!quoteLoading && currentQuote.text && (
              <>
                <p className="text-sm sm:text-base italic leading-snug group-hover:opacity-80 transition-opacity">
                  "{currentQuote.text}"
                </p>
                {currentQuote.author && (
                  <p className="text-xs sm:text-sm font-medium mt-1 opacity-70 group-hover:opacity-90 transition-opacity">
                    - {currentQuote.author}
                  </p>
                )}
              </>
            )}
          </div>
        </header>
      )}

      {/* Main Content: Đồng hồ, Lời chào (Pomodoro) hoặc Trống (Ambient) */}
      {pageMode === "pomodoro" && (
        <main className="flex-grow flex flex-col items-center justify-center text-center w-full z-0 -mt-10 sm:-mt-16">
          {/* Lời chào */}
          <p className="text-xl sm:text-2xl md:text-3xl font-medium text-slate-700 dark:text-slate-300 mb-3 sm:mb-4 md:mb-6 animate-fadeIn">
            {greeting}
          </p>

          {/* Đồng hồ lớn HH:MM */}
          <div
            className="text-[clamp(5rem,25vw,11rem)] sm:text-[clamp(6rem,30vw,15rem)] font-mono font-extrabold text-slate-800 dark:text-white cursor-default transition-opacity hover:opacity-90"
            title="Thời gian hiện tại">
            {formatLargeDisplayTime(currentTime)}
          </div>

          {/* TODO: NẾU BẠN CÓ POMODORO TIMER, CÓ THỂ ĐẶT Ở ĐÂY */}
          {/* <div className="mt-8 w-full max-w-sm">
            <PomodoroTimer />
          </div> */}
        </main>
      )}

      {/* Ambient Timer: Chỉ hiển thị ở Ambient Mode */}
      {pageMode === "ambient" && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <AmbientTimer />
        </div>
      )}

      {/* Footer: Thanh công cụ */}
      <footer className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex flex-col items-end space-y-3">
        {/* Nhóm nút chính và chuyển đổi mode */}
        <div className="flex items-center bg-slate-700/60 dark:bg-slate-800/70 backdrop-blur-md rounded-full shadow-xl p-1.5 sm:p-2 space-x-1 sm:space-x-1.5">
          {utilityButtons.map((btn) => (
            <button
              key={btn.title}
              title={btn.title}
              onClick={btn.action}
              disabled={btn.disabled}
              className={`p-2 sm:p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 dark:hover:bg-black/20 transition-colors`}>
              <btn.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          ))}

          {/* Nút chuyển Theme (Dark/Light) - Ví dụ */}
          <button
            title={`Chuyển sang ${theme === "light" ? "Dark" : "Light"} Mode`}
            onClick={toggleTheme} // Giả sử hàm này có trong ThemeContext
            className="p-2 sm:p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 dark:hover:bg-black/20 transition-colors">
            {theme === "light" ? (
              <MoonIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <SunIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>

          {/* Nút chuyển Mode (Pomodoro/Ambient) */}
          <button
            title={
              pageMode === "pomodoro"
                ? "Chuyển sang Ambient Mode"
                : "Chuyển sang Pomodoro Mode"
            }
            onClick={() =>
              togglePageMode(pageMode === "pomodoro" ? "ambient" : "pomodoro")
            }
            className={`p-2 sm:p-2.5 rounded-full transition-all duration-300 transform hover:scale-110
                        ${
                          pageMode === "ambient"
                            ? "bg-pink-500/80 hover:bg-pink-500 text-white"
                            : "text-white/80 hover:text-white hover:bg-white/10 dark:hover:bg-black/20"
                        }`}>
            {pageMode === "pomodoro" ? (
              <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>

          {/* Các nút action chính */}
          {mainActionButtons.map((btn) => (
            <button
              key={btn.title}
              title={btn.title}
              onClick={btn.action}
              disabled={btn.disabled}
              className={`p-2 sm:p-2.5 rounded-full transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50
                          ${
                            btn.disabled
                              ? "text-slate-400/70 dark:text-slate-500/70 cursor-not-allowed"
                              : "text-white/80 hover:text-white hover:bg-white/10 dark:hover:bg-black/20"
                          }`}>
              <btn.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
