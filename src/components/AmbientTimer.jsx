// src/components/AmbientTimer.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  PauseIcon,
  PlayIcon,
  ArrowPathIcon as ResetIcon,
} from "@heroicons/react/20/solid";

const LOCAL_STORAGE_KEY_AMBIENT = "ambientTimerState";

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
      <div
        className="bg-black/60 dark:bg-slate-800/80 backdrop-blur-md text-white p-3 sm:p-4 rounded-xl shadow-2xl w-48 sm:w-56 flex items-center justify-center"
        style={{ height: "105px" }}>
        {" "}
        {/* Đặt chiều cao cố định để không giật layout */}
        <p className="text-slate-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-black/60 dark:bg-slate-800/80 backdrop-blur-md text-white p-3 sm:p-4 rounded-xl shadow-2xl w-48 sm:w-56">
      <div className="text-3xl sm:text-4xl font-mono font-bold text-center mb-2 sm:mb-3">
        {formatDisplayTime(totalSecondsRun)}
      </div>
      <div className="flex justify-around items-center mt-1">
        <button
          onClick={handleTogglePlayPause}
          className="p-2 text-slate-100 hover:text-white hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          title={isActive ? "Pause Session" : "Resume Session"}>
          {isActive ? (
            <PauseIcon className="w-6 h-6" />
          ) : (
            <PlayIcon className="w-6 h-6" />
          )}
        </button>
        <button
          onClick={handleReset}
          className="p-2 text-slate-100 hover:text-white hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          title="Reset Timer">
          <ResetIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default AmbientTimer;
