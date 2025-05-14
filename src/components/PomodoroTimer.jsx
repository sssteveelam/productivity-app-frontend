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
  const [notificationPermission, setNotificationPermission] =
    useState("default");

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Kiểm tra quyền thông báo khi component mount
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    } else {
      console.warn("'Trình duyệt này không hỗ trợ thông báo trên desktop.'");
      setNotificationPermission("unsupported"); // Hoặc 'denied' để đơn giản
    }
  }, []);

  // Hàm yêu cầu quyền thông báo
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("Trình duyệt này không hỗ trợ thông báo trên desktop.");
      setNotificationPermission("unsupported");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        new Notification("Thông báo Pomodoro đã được bật!", {
          body: "Bạn sẽ nhận được thông báo khi hết mỗi phiên.",
          icon: "/icons/pomodoro-icon.png",
        });
      } else if (permission === "denied") {
        alert(
          "Bạn đã từ chối nhận thông báo. Nếu muốn bật lại, hãy kiểm tra cài đặt thông báo của trình duyệt cho trang này."
        );
      }
    } catch (error) {
      // Xử lý cho các trình duyệt cũ hơn có thể dùng callback
      Notification.requestPermission(function (permission) {
        setNotificationPermission(permission);
        if (permission === "granted") {
          new Notification("Thông báo Pomodoro đã được bật!", {
            body: "Bạn sẽ nhận được thông báo khi hết mỗi phiên.",
            icon: "/icons/pomodoro-icon.png",
          });
        } else if (permission === "denied") {
          alert(
            "Bạn đã từ chối nhận thông báo. Nếu muốn bật lại, hãy kiểm tra cài đặt thông báo của trình duyệt cho trang này."
          );
        }
      });
      console.error("Lỗi khi yêu cầu quyền thông báo:", error);
    }
  };

  // Hàm hiển thị thông báo desktop
  const showDesktopNotification = (title, body) => {
    if (notificationPermission === "granted") {
      // Chỉ hiển thị nếu tab không active (người dùng đang ở tab/ứng dụng khác)
      if (document.hidden) {
        new Notification(title, {
          body: body,
          icon: "/icons/pomodoro-icon.png", // Đường dẫn tới icon trong thư mục public
          tag: "pomodoro-cycle-notification", // tag giúp thông báo mới thay thế thông báo cũ có cùng tag
        });
      }
    }
  };

  const switchMode = () => {
    setIsActive(false);
    let nextMode = "";
    let nextMinutes = 0;
    let notificationTitle = "";
    let notificationBody = "";
    let newPomodoroCount = pomodoroCount;

    if (audioRef.current) {
      audioRef.current
        .play()
        .catch((error) => console.warn("Lỗi khi phát âm thanh:", error));
    }

    if (mode === "work") {
      newPomodoroCount = pomodoroCount + 1;
      setPomodoroCount(newPomodoroCount);
      notificationTitle = "Hết Giờ Làm Việc!";
      if (
        newPomodoroCount > 0 &&
        newPomodoroCount % POMODOROS_PER_LONG_BREAK === 0
      ) {
        nextMode = "longBreak";
        nextMinutes = LONG_BREAK_DURATION_MINUTES;
        notificationBody = `Tuyệt vời! Đã hoàn thành ${POMODOROS_PER_LONG_BREAK} Pomodoro. Nghỉ dài thôi! 🥳`;
      } else {
        nextMode = "shortBreak";
        nextMinutes = SHORT_BREAK_DURATION_MINUTES;
        notificationBody = "Nghỉ ngắn chút nha bạn ơi! 🎉";
      }
    } else if (mode === "shortBreak") {
      nextMode = "work";
      nextMinutes = WORK_DURATION_MINUTES;
      notificationTitle = "Hết Giờ Nghỉ Ngắn!";
      notificationBody = "Năng lượng tràn trề, chiến đấu tiếp thôi nào! 💪";
    } else {
      // mode === "longBreak"
      nextMode = "work";
      nextMinutes = WORK_DURATION_MINUTES;
      notificationTitle = "Hết Giờ Nghỉ Dài!";
      notificationBody = "Sẵn sàng cho chu kỳ Pomodoro mới nhé! 🚀";
      setPomodoroCount(0);
    }

    setMode(nextMode);
    setMinutes(nextMinutes);
    setSeconds(0);

    // Gọi hàm hiển thị thông báo desktop thay vì/hoặc cùng với alert
    showDesktopNotification(notificationTitle, notificationBody);
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

  const displayTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
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

    let titlePrefix = "";
    if (isActive) {
      titlePrefix = `${displayModeLabel} -  ${displayTime} `;

      if (mode === "work" && focusTaskName) {
        titlePrefix += ` | ${focusTaskName}`;
      }
    } else {
      if (minutes > 0 || seconds > 0) {
        titlePrefix = `Sẵn sàng: ${displayModeLabel} - ${displayTime}`;
      } else {
        // eslint-disable-next-line no-unused-vars
        titlePrefix = `Hoàn thành ${displayModeLabel}!`;
      }
    }

    document.title = titlePrefix || "Pomodoro Timer";
  }, [
    minutes,
    seconds,
    isActive,
    mode,
    focusTaskName,
    displayTime,
    displayModeLabel,
  ]);

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

      {/* Nút yêu cầu quyền thông báo */}
      {notificationPermission === "default" && (
        <div className="mb-4 text-center">
          <button
            onClick={requestNotificationPermission}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition duration-150 ease-in-out">
            Bật Thông Báo Desktop
          </button>
          <p className="text-xs text-slate-500 mt-1">
            Để nhận thông báo khi hết mỗi phiên.
          </p>
        </div>
      )}
      {notificationPermission === "denied" && (
        <p className="text-xs text-red-500 text-center mb-4">
          Bạn đã tắt thông báo. Hãy vào cài đặt trình duyệt để bật lại.
        </p>
      )}

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
