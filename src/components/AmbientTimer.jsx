// src/components/AmbientTimer.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  PauseIcon,
  PlayIcon,
  ArrowPathIcon as ResetIcon,
} from "@heroicons/react/20/solid";
import { motion } from "framer-motion"; // Import motion

const LOCAL_STORAGE_KEY_AMBIENT = "ambientTimerState";

// Định nghĩa variants cho animation
const timerVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 }, // Trạng thái ban đầu: mờ, hơi nhỏ, hơi dịch xuống
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }, // Thời gian và kiểu animation vào
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: { duration: 0.3, ease: "easeIn" }, // Thời gian và kiểu animation ra
  },
};

function AmbientTimer() {
  // Khởi tạo state với giá trị null ban đầu để biết khi nào localStorage đã được đọc
  const [totalSecondsRun, setTotalSecondsRun] = useState(null);
  const [isActive, setIsActive] = useState(null);

  const intervalRef = useRef(null);
  const initialLoadRef = useRef(true); // Ref để đánh dấu lần tải đầu tiên

  // 1. Tải trạng thái từ localStorage khi component mount
  useEffect(() => {
    const savedStateString = localStorage.getItem(LOCAL_STORAGE_KEY_AMBIENT);
    if (savedStateString) {
      try {
        const savedState = JSON.parse(savedStateString);
        if (
          typeof savedState.totalSecondsRun === "number" &&
          typeof savedState.isActive === "boolean"
        ) {
          setTotalSecondsRun(savedState.totalSecondsRun);
          setIsActive(savedState.isActive);
        } else {
          // Dữ liệu không hợp lệ, bắt đầu mới
          localStorage.removeItem(LOCAL_STORAGE_KEY_AMBIENT);
          setTotalSecondsRun(0);
          setIsActive(true); // Tự động chạy nếu không có state hợp lệ
        }
      } catch (error) {
        console.error(
          "Lỗi khi parse ambient timer state từ localStorage:",
          error
        );
        localStorage.removeItem(LOCAL_STORAGE_KEY_AMBIENT);
        setTotalSecondsRun(0);
        setIsActive(true);
      }
    } else {
      // Không có state đã lưu, tự động bắt đầu timer
      setTotalSecondsRun(0);
      setIsActive(true);
    }
    initialLoadRef.current = false; // Đánh dấu đã qua lần tải đầu tiên
  }, []); // Chỉ chạy một lần khi component mount

  // 2. Logic đếm tiến
  useEffect(() => {
    // Chỉ chạy interval nếu isActive là true (sau khi đã load từ localStorage)
    if (isActive === true) {
      intervalRef.current = setInterval(() => {
        setTotalSecondsRun((prevTotalSeconds) => prevTotalSeconds + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => {
      clearInterval(intervalRef.current);
      document.title = "Focus App";
    };
  }, [isActive]); // Phụ thuộc vào isActive

  // 3. Lưu trạng thái vào localStorage mỗi khi totalSecondsRun hoặc isActive thay đổi,
  //    NHƯNG chỉ sau khi đã load xong từ localStorage lần đầu.
  useEffect(() => {
    if (
      initialLoadRef.current ||
      totalSecondsRun === null ||
      isActive === null
    ) {
      return;
    }
    localStorage.setItem(
      LOCAL_STORAGE_KEY_AMBIENT,
      JSON.stringify({ totalSecondsRun, isActive })
    );
  }, [totalSecondsRun, isActive]);

  // 4. Cập nhật tiêu đề tab trình duyệt
  const formatTimeForTitle = (totalSeconds) => {
    const H = Math.floor(totalSeconds / 3600);
    const M = Math.floor((totalSeconds % 3600) / 60);
    const S = totalSeconds % 60;
    if (H > 0)
      return `${H}:${M.toString().padStart(2, "0")}:${S.toString().padStart(
        2,
        "0"
      )}`;
    return `${M.toString().padStart(2, "0")}:${S.toString().padStart(2, "0")}`;
  };
  useEffect(() => {
    if (totalSecondsRun === null) return; // Đừng cập nhật title nếu chưa load xong
    let title = "Ambient Mode";
    if (isActive) {
      title = ` ${formatTimeForTitle(totalSecondsRun)} | Ambient`;
    } else if (totalSecondsRun > 0) {
      title = `${formatTimeForTitle(totalSecondsRun)} | Ambient Paused `;
    }
    document.title = title;
  }, [totalSecondsRun, isActive]);

  const handleTogglePlayPause = () => {
    if (isActive === null) return; // Chờ load xong
    setIsActive((prevIsActive) => !prevIsActive);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setTotalSecondsRun(0);
    localStorage.removeItem(LOCAL_STORAGE_KEY_AMBIENT);
    setIsActive(true);
  };

  const formatDisplayTime = (totalSeconds) => {
    if (totalSeconds === null) return "00:00"; // Hiển thị mặc định khi đang load
    const H = Math.floor(totalSeconds / 3600);
    const M = Math.floor((totalSeconds % 3600) / 60);
    const S = totalSeconds % 60;
    if (H > 0)
      return `${H.toString().padStart(2, "0")}:${M.toString().padStart(
        2,
        "0"
      )}:${S.toString().padStart(2, "0")}`;
    return `${M.toString().padStart(2, "0")}:${S.toString().padStart(2, "0")}`;
  };

  if (totalSecondsRun === null || isActive === null) {
    return (
      <motion.div // Có thể animate cả phần loading
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-black/30 dark:bg-slate-900/50 backdrop-blur-sm text-white p-4 rounded-xl shadow-2xl w-56 sm:w-64 flex items-center justify-center fixed top-4 right-4 sm:top-6 sm:right-6 z-50" // Giữ vị trí cố định
        style={{ height: "120px" }}>
        <p className="text-slate-300 dark:text-slate-400 animate-pulse">
          Loading Ambient...
        </p>
      </motion.div>
    );
  }

  return (
    // Sử dụng motion.div cho card timer và áp dụng variants
    <motion.div
      variants={timerVariants}
      initial="hidden" // Trạng thái ban đầu khi component sắp được mount
      animate="visible" // Trạng thái khi component đã mount và hiển thị
      exit="exit" // Trạng thái khi component sắp unmount
      className="bg-black/40 dark:bg-slate-800/80 backdrop-blur-lg text-white p-4 sm:p-5 rounded-2xl shadow-2xl w-56 sm:w-64 transform hover:shadow-purple-500/40 dark:hover:shadow-purple-600/40 fixed top-4 right-4 sm:top-6 sm:right-6 z-50"
      // Bỏ class 'transition-all duration-300' của Tailwind nếu Framer Motion đã xử lý
    >
      {/* Thời gian đếm tiến */}
      <div className="text-4xl sm:text-5xl md:text-[3.8rem] font-mono font-bold text-center mb-2 sm:mb-3 text-white tracking-wider">
        {/* Tăng kích thước font, màu trắng, tracking */}
        {formatDisplayTime(totalSecondsRun)}
      </div>

      {/* Các nút điều khiển */}
      <div className="flex justify-evenly items-center mt-3 sm:mt-4">
        <button
          onClick={handleTogglePlayPause}
          className="p-2.5 text-slate-100 hover:text-white bg-white/10 hover:bg-white/20 dark:bg-slate-700/50 dark:hover:bg-slate-600/70 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 focus:ring-opacity-75"
          title={isActive ? "Pause Session" : "Resume Session"}>
          {isActive ? (
            <PauseIcon className="w-6 h-6 sm:w-7 sm:h-7" />
          ) : (
            <PlayIcon className="w-6 h-6 sm:w-7 sm:h-7" />
          )}
        </button>
        <button
          onClick={handleReset}
          className="p-2.5 text-slate-100 hover:text-white bg-white/10 hover:bg-white/20 dark:bg-slate-700/50 dark:hover:bg-slate-600/70 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 focus:ring-opacity-75"
          title="Reset Timer">
          <ResetIcon className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
      </div>
    </motion.div>
  );
}

export default AmbientTimer;
