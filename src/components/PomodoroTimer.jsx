/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from "react";

const WORK_DURATION_MINUTES = 1;
const SHORT_BREAK_DURATION_MINUTES = 5;
const LONG_BREAK_DURATION_MINUTES = 15;
const POMODOROS_PER_LONG_BREAK = 4;

// Giá trị cài đặt mặc định ban đầu
const initialSettings = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  pomodorosPerLongBreak: 4,
};

function PomodoroTimer({ focusTaskName = null }) {
  // State cho cài đặt, khởi tạo với giá trị mặc định
  const [settings, setSettings] = useState(initialSettings);

  const [minutes, setMinutes] = useState(WORK_DURATION_MINUTES);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("work"); // 'work', 'shortBreak', 'longBreak'
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [notificationPermission, setNotificationPermission] =
    useState("default");

  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const NOTIFICATION_ICON_PATH = "/icons/pomodoro-icon.png";

  // --- QUẢN LÝ CÀI ĐẶT ---
  // 1. Tải cài đặt từ localStorage khi component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("pomodoroSettings");
    if (savedSettings) {
      const loadedSettings = JSON.parse(savedSettings);
      setSettings(loadedSettings);
      // Nếu timer không chạy, cập nhật thời gian theo cài đặt đã tải và mode hiện tại (thường là 'work')

      if (!isActive) {
        if (mode === "work") setMinutes(loadedSettings.work);
        else if (mode === "shortBreak") setMinutes(loadedSettings.shortBreak);
        else if (mode === "longBreak") setMinutes(loadedSettings.longBreak);
        setSeconds(0);
      }
    } else {
      // Nếu không có gì trong localStorage, đảm bảo timer bắt đầu với initialSettings.work

      if (!isActive && mode === "work") {
        setMinutes(initialSettings.work);
        setSeconds(0);
      }
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lưu cài đặt vào localStorage mỗi khi state `settings` thay đổi
  useEffect(() => {
    localStorage.setItem("pomodoroSettings", JSON.stringify(settings));
  }, [settings]);

  // 3. Cập nhật thời gian hiển thị khi settings hoặc mode thay đổi (và timer không chạy)
  //    Điều này hữu ích khi người dùng thay đổi giá trị trong input settings.
  useEffect(() => {
    if (!isActive) {
      if (mode === "work") {
        setMinutes(settings.work);
      } else if (mode === "shortBreak") {
        setMinutes(settings.shortBreak);
      } else if (mode === "longBreak") {
        setMinutes(settings.longBreak);
      }
      setSeconds(0);
    }
  }, [settings, mode]);

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

  // --- LOGIC TIMER ---
  const switchMode = useCallback(() => {
    setIsActive(false);
    let nextMode = "";
    let nextMinutes = 0;
    let notificationTitle = "";
    let notificationBody = "";
    let newPomodoroCount = pomodoroCount;

    if (audioRef.current)
      audioRef.current
        .play()
        .catch((e) => console.warn("Audio play failed", e));

    if (mode === "work") {
      newPomodoroCount = pomodoroCount + 1;
      if (
        newPomodoroCount > 0 &&
        newPomodoroCount % settings.pomodorosPerLongBreak === 0
      ) {
        nextMode = "longBreak";
        nextMinutes = settings.longBreak;
        notificationTitle = "Hết Giờ Làm Việc!";
        notificationBody = `Tuyệt vời! Đã hoàn thành ${settings.pomodorosPerLongBreak} Pomodoro. Nghỉ dài thôi! 🥳`;
      } else {
        nextMode = "shortBreak";
        nextMinutes = settings.shortBreak;
        notificationTitle = "Hết Giờ Làm Việc!";
        notificationBody = "Nghỉ ngắn chút nha bạn ơi! 🎉";
      }
    } else if (mode === "shortBreak") {
      nextMode = "work";
      nextMinutes = settings.work;
      notificationTitle = "Hết Giờ Nghỉ Ngắn!";
      notificationBody = "Năng lượng tràn trề, chiến đấu tiếp thôi nào! 💪";
    } else {
      // mode === "longBreak"
      nextMode = "work";
      nextMinutes = settings.work;
      notificationTitle = "Hết Giờ Nghỉ Dài!";
      notificationBody = "Sẵn sàng cho chu kỳ Pomodoro mới nhé! 🚀";
      newPomodoroCount = 0; // Reset pomodoroCount khi kết thúc nghỉ dài
    }

    setPomodoroCount(newPomodoroCount); // Cập nhật pomodoroCount một lần ở đây
    setMode(nextMode);
    setMinutes(nextMinutes);
    setSeconds(0);
    showDesktopNotification(notificationTitle, notificationBody);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, pomodoroCount, settings, showDesktopNotification]); // Thêm các dependency cần thiết

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
  }, [minutes, seconds, isActive, mode, focusTaskName, settings, switchMode]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setMode("work");
    setMinutes(settings.work);
    setSeconds(0);
    setPomodoroCount(0);
  };

  // --- HÀM XỬ LÝ THAY ĐỔI CÀI ĐẶT ---
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    let numValue = parseInt(value, 10);

    // Validate input
    if (isNaN(numValue) || numValue < 1) numValue = 1;
    if (name === "pomodorosPerLongBreak" && numValue > 10)
      numValue = 10; // Giới hạn pomodoros/cycle
    else if (name !== "pomodorosPerLongBreak" && numValue > 180) numValue = 180; // Giới hạn thời gian 3 tiếng

    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: numValue,
    }));
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
            {settings.pomodorosPerLongBreak} Pomodoro
          </p>
        </div>
        {/* --- KHU VỰC CÀI ĐẶT --- */}
        <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl max-w-md w-full text-slate-700">
          <h3 className="text-xl font-semibold text-center mb-6 text-sky-700">
            Tùy Chỉnh Pomodoro
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label htmlFor="work" className="block text-sm font-medium mb-1">
                Làm việc (phút):
              </label>
              <input
                type="number"
                name="work"
                id="work"
                value={settings.work}
                onChange={handleSettingsChange}
                min="1"
                max="180"
                className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <label
                htmlFor="shortBreak"
                className="block text-sm font-medium mb-1">
                Nghỉ ngắn (phút):
              </label>
              <input
                type="number"
                name="shortBreak"
                id="shortBreak"
                value={settings.shortBreak}
                onChange={handleSettingsChange}
                min="1"
                max="180"
                className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label
                htmlFor="longBreak"
                className="block text-sm font-medium mb-1">
                Nghỉ dài (phút):
              </label>
              <input
                type="number"
                name="longBreak"
                id="longBreak"
                value={settings.longBreak}
                onChange={handleSettingsChange}
                min="1"
                max="180"
                className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label
                htmlFor="pomodorosPerLongBreak"
                className="block text-sm font-medium mb-1">
                Pomodoros / Nghỉ dài:
              </label>
              <input
                type="number"
                name="pomodorosPerLongBreak"
                id="pomodorosPerLongBreak"
                value={settings.pomodorosPerLongBreak}
                onChange={handleSettingsChange}
                min="1"
                max="10"
                className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          <button
            onClick={() => {
              setSettings(initialSettings);
              handleReset();
            }} // Reset về mặc định và reset timer
            className="mt-6 w-full py-2 px-4 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition duration-150">
            Đặt Lại Mặc Định
          </button>
        </div>
      </div>
    </div>
  );
}

export default PomodoroTimer;
