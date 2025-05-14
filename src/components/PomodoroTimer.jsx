/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";

const WORK_DURATION_MINUTES = 1;
const SHORT_BREAK_DURATION_MINUTES = 5;
const LONG_BREAK_DURATION_MINUTES = 15;
const POMODOROS_PER_LONG_BREAK = 4;

function PomodoroTimer({ focusTaskName = null }) {
  const [minutes, setMinutes] = useState(WORK_DURATION_MINUTES);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("work"); // 'work', 'shortBreak', 'longBreak'
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const switchMode = () => {
    setIsActive(false);
    let nextMode = "";
    let nextMinutes = 0;
    let alertMessage = "";
    let newPomodoroCount = pomodoroCount;

    // --- PHÁT ÂM THANH THÔNG BÁO ---
    if (audioRef.current) {
      /* empty */
      audioRef.current.play().catch((error) => {
        console.warn("Lỗi khi phát âm thanh thông báo:", error);
      });
    }

    if (mode === "work") {
      newPomodoroCount = pomodoroCount + 1;
      setPomodoroCount(newPomodoroCount);

      if (newPomodoroCount % POMODOROS_PER_LONG_BREAK === 0) {
        nextMode = "longBreak";
        nextMinutes = LONG_BREAK_DURATION_MINUTES;
        alertMessage = `Tuyệt vời! Bạn đã hoàn thành ${POMODOROS_PER_LONG_BREAK} Pomodoro. Giờ là lúc nghỉ dài! 🥳`;
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
      nextMode = "work";
      nextMinutes = WORK_DURATION_MINUTES;
      alertMessage =
        "Hết giờ nghỉ dài! Sẵn sàng cho chu kỳ Pomodoro mới nhé! 🚀";
      setPomodoroCount(0);
    }

    setMode(nextMode);
    setMinutes(nextMinutes);
    setSeconds(0);
    alert(alertMessage);
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

  const displayModeLabel =
    mode === "work"
      ? "Thời Gian Làm Việc"
      : mode === "shortBreak"
      ? "Thời Gian Nghỉ Ngắn"
      : "Thời Gian Nghỉ Dài";

  useEffect(() => {
    if (isActive && minutes === 0 && seconds === 0) {
      switchMode();
    }
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
      document.title = "Pomodoro Timer";
    }
  }, [minutes, seconds, isActive, mode, switchMode, displayModeLabel]); // Added missing dependencies

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setMode("work");
    setMinutes(WORK_DURATION_MINUTES);
    setSeconds(0);
    setPomodoroCount(0);
  };

  const displayTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const cardBorderColor =
    mode === "work"
      ? "border-sky-500"
      : mode === "shortBreak"
      ? "border-emerald-500"
      : "border-amber-500";

  const headingTextColor =
    mode === "work"
      ? "text-sky-600"
      : mode === "shortBreak"
      ? "text-emerald-600"
      : "text-amber-600";

  const startPauseButtonColor = isActive
    ? "bg-orange-500 hover:bg-orange-600 focus:ring-orange-400"
    : mode === "work"
    ? "bg-sky-500 hover:bg-sky-600 focus:ring-sky-400"
    : mode === "shortBreak"
    ? "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400"
    : "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400";

  const baseButtonClass =
    "py-3 px-6 text-lg font-semibold text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out active:transform active:scale-95 min-w-[140px] w-full sm:w-auto";

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 space-y-6 text-center">
      {/* THÊM THẺ AUDIO Ở ĐÂY */}
      <audio
        ref={audioRef}
        src="/sounds/notification.mp3"
        preload="auto"
        style={{ display: "none" }}></audio>
      <div
        className={`
          text-center p-6 sm:p-8
          border-4 ${cardBorderColor}
          rounded-2xl
          max-w-sm w-full
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
        {mode === "work" && focusTaskName && (
          <p className="text-sm text-slate-600 mb-3 font-medium italic">
            Đang tập trung:{" "}
            <span className="font-semibold not-italic text-slate-700">
              {focusTaskName}
            </span>
          </p>
        )}
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

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-slate-600 text-base">
            Đã hoàn thành:{" "}
            <span className="font-bold text-lg">{pomodoroCount}</span> /{" "}
            {POMODOROS_PER_LONG_BREAK} Pomodoro
          </p>
        </div>
      </div>
    </div>
  );
}

export default PomodoroTimer;
