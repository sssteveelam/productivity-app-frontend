// src/components/PomodoroTimer.jsx
import React, { useState, useEffect, useRef } from "react";

// Thời gian mặc định cho các phiên (tính bằng phút)
const WORK_DURATION_MINUTES = 25;
const SHORT_BREAK_DURATION_MINUTES = 5;
const LONG_BREAK_DURATION_MINUTES = 15; // Đã bỏ comment
const POMODOROS_PER_LONG_BREAK = 4; // Đã bỏ comment: Số phiên Pomodoro trước khi nghỉ dài

function PomodoroTimer() {
  const [minutes, setMinutes] = useState(WORK_DURATION_MINUTES);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("work"); // 'work', 'shortBreak', 'longBreak'
  const [pomodoroCount, setPomodoroCount] = useState(0); // Đã bỏ comment: Đếm số Pomodoro đã hoàn thành trong chu kỳ hiện tại

  const intervalRef = useRef(null);

  const switchMode = () => {
    setIsActive(false);
    let nextMode = "";
    let nextMinutes = 0;
    let alertMessage = "";
    let newPomodoroCount = pomodoroCount; // Giữ nguyên count nếu không phải là kết thúc phiên work

    if (mode === "work") {
      newPomodoroCount = pomodoroCount + 1; // Tăng số Pomodoro đã hoàn thành
      setPomodoroCount(newPomodoroCount); // Cập nhật state

      if (newPomodoroCount % POMODOROS_PER_LONG_BREAK === 0) {
        nextMode = "longBreak";
        nextMinutes = LONG_BREAK_DURATION_MINUTES;
        alertMessage = `Tuyệt vời! Bạn đã hoàn thành ${POMODOROS_PER_LONG_BREAK} Pomodoro. Giờ là lúc nghỉ dài! 🥳`;
        // Không reset pomodoroCount ở đây, sẽ reset khi long break kết thúc
      } else {
        nextMode = "shortBreak";
        nextMinutes = SHORT_BREAK_DURATION_MINUTES;
        alertMessage =
          "Hết giờ làm việc rồi! Mình nghỉ ngắn chút nha bạn ơi! 🎉";
      }
    } else if (mode === "shortBreak") {
      nextMode = "work";
      nextMinutes = WORK_DURATION_MINUTES;
      alertMessage =
        "Hết giờ nghỉ ngắn! Năng lượng tràn trề, chiến đấu tiếp thôi nào! 💪";
    } else {
      // mode === "longBreak"
      nextMode = "work";
      nextMinutes = WORK_DURATION_MINUTES;
      alertMessage =
        "Hết giờ nghỉ dài! Sẵn sàng cho chu kỳ Pomodoro mới nhé! 🚀";
      setPomodoroCount(0); // Reset pomodoroCount khi kết thúc nghỉ dài, bắt đầu chu kỳ mới
    }

    setMode(nextMode);
    setMinutes(nextMinutes);
    setSeconds(0);
    alert(alertMessage); // Hiển thị thông báo
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds > 0) {
            return prevSeconds - 1;
          } else {
            setMinutes((prevMinutes) => {
              if (prevMinutes > 0) {
                return prevMinutes - 1;
              } else {
                return 0;
              }
            });
            return 59;
          }
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  useEffect(() => {
    if (isActive && minutes === 0 && seconds === 0) {
      switchMode();
    }
    // Cập nhật tiêu đề trang với thời gian còn lại và chế độ
    if (isActive) {
      document.title = `${displayModeLabel} - ${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else if (
      mode === "work" &&
      minutes === WORK_DURATION_MINUTES &&
      seconds === 0
    ) {
      document.title = "Sẵn sàng làm việc!";
    } else {
      document.title = "Pomodoro Timer"; // Tiêu đề mặc định
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutes, seconds, isActive, mode]); // Thêm displayModeLabel để cập nhật title nếu tên mode thay đổi

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setMode("work");
    setMinutes(WORK_DURATION_MINUTES);
    setSeconds(0);
    setPomodoroCount(0); // Reset cả số Pomodoro khi nhấn nút Reset
  };

  const displayTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  let displayModeLabel = "Thời Gian Làm Việc";
  if (mode === "shortBreak") {
    displayModeLabel = "Thời Gian Nghỉ Ngắn";
  } else if (mode === "longBreak") {
    displayModeLabel = "Thời Gian Nghỉ Dài";
  }

  const cardBorderColor =
    mode === "work"
      ? "border-sky-500"
      : mode === "shortBreak"
      ? "border-emerald-500"
      : "border-amber-500"; // Màu vàng cam cho nghỉ dài

  const headingTextColor =
    mode === "work"
      ? "text-sky-600"
      : mode === "shortBreak"
      ? "text-emerald-600"
      : "text-amber-600";

  const startPauseButtonColor = isActive
    ? "bg-orange-500 hover:bg-orange-600 focus:ring-orange-400" // Màu cam đậm hơn khi đang Pause
    : mode === "work"
    ? "bg-sky-500 hover:bg-sky-600 focus:ring-sky-400"
    : mode === "shortBreak"
    ? "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400"
    : "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400"; // Màu nút Start cho nghỉ dài

  const baseButtonClass =
    "py-3 px-6 text-lg font-semibold text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out active:transform active:scale-95 min-w-[140px] w-full sm:w-auto";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-sky-300 selection:text-sky-900">
      <div
        className={`
          text-center p-6 sm:p-8
          border-4 ${cardBorderColor}
          rounded-2xl
          max-w-md w-full
          mx-auto
          bg-white/90 backdrop-blur-sm
          shadow-2xl
          transition-colors duration-300 ease-in-out
        `}>
        <h2
          className={`
            ${headingTextColor}
            mb-4 sm:mb-6
            text-2xl sm:text-3xl
            font-bold tracking-tight
            transition-colors duration-300 ease-in-out
          `}>
          {displayModeLabel}
        </h2>

        <div
          className={`
            text-[clamp(3.5rem,18vw,6rem)] 
            font-mono font-extrabold 
            text-slate-800
            my-6 sm:my-8
            py-4 
            bg-slate-100/80 
            rounded-lg
            shadow-inner 
          `}>
          {displayTime}
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-5">
          <button
            onClick={handleStartPause}
            className={`
              ${baseButtonClass}
              ${startPauseButtonColor}
              focus:ring-opacity-75 
            `}>
            {isActive ? "Tạm Dừng" : "Bắt Đầu"}
          </button>
          <button
            onClick={handleReset}
            className={`
              ${baseButtonClass}
              bg-slate-500 hover:bg-slate-600
              focus:ring-slate-400 focus:ring-opacity-75
            `}>
            Reset
          </button>
        </div>

        {/* Hiển thị số Pomodoro đã hoàn thành */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-slate-600 text-base">
            Đã hoàn thành:{" "}
            <span className="font-bold text-lg">{pomodoroCount}</span> /{" "}
            {POMODOROS_PER_LONG_BREAK} Pomodoro
          </p>
        </div>
      </div>

      <footer className="text-center mt-8">
        <p className="text-sm text-slate-500">
          💡 Mẹo nhỏ: Tập trung cao độ trong phiên làm việc nhé! Cố lên, bạn làm
          được mà! 🚀
        </p>
      </footer>
    </div>
  );
}

export default PomodoroTimer;
