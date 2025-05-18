/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  PlayIcon as PlaySolidIcon,
  PauseIcon as PauseSolidIcon,
  ArrowPathIcon,
  ForwardIcon,
  Cog6ToothIcon as SettingsSolidIcon,
} from "@heroicons/react/20/solid";

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

  const [elapsedSecondsInSession, setElapsedSecondsInSession] = useState(0);

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

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds > 0) {
            setElapsedSecondsInSession((prev) => prev + 1); // Tăng thời gian đã trôi qua

            return prevSeconds - 1;
          } else {
            setMinutes((prevMinutes) => {
              if (prevMinutes > 0) {
                setElapsedSecondsInSession((prev) => prev + 1); // Tăng thời gian đã trôi qua
                return prevMinutes - 1;
              } else {
                // prevMinutes === 0 (và prevSeconds cũng là 0 trước đó)
                // Hết giờ - logic chuyển mode sẽ xử lý ở useEffect khác

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

  // --- LOGIC TIMER ---
  const switchMode = useCallback(() => {
    setIsActive(false);
    setElapsedSecondsInSession(0); // Reset thời gian đã trôi qua khi chuyển mode
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
    if (!isActive && minutes === 0 && seconds === 0) {
      if (mode === "work") setMinutes(settings.work);
      else if (mode === "shortBreak") setMinutes(settings.shortBreak);
      else if (mode === "longBreak") setMinutes(settings.longBreak);
      setSeconds(0);
      setElapsedSecondsInSession(0);
    }

    setIsActive(!isActive);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setMode("work");
    setMinutes(settings.work);
    setSeconds(0);
    setPomodoroCount(0);
    setElapsedSecondsInSession(0);
  };

  const handleSkipSession = () => {
    // Đơn giản là gọi switchMode để chuyển sang phiên tiếp theo
    // Nếu bạn muốn logic phức tạp hơn (ví dụ: chỉ skip khi đang làm việc), có thể thêm ở đây
    switchMode();
  };

  // Thêm hàm xử lý cho nút "Settings" (hiện tại chỉ log ra console)
  const handleOpenTimerSettings = () => {
    console.log("Mở cài đặt Pomodoro Timer (sẽ làm sau)");
    // Sau này sẽ gọi hàm để mở panel cài đặt cho riêng Pomodoro Timer
    // hoặc mở phần cài đặt Focus Timer trong Panel Cài đặt lớn.
  };

  // Hàm định dạng thời gian cho "Current" (thời gian đã trôi qua)
  const formatElapsedSessionTime = (totalSeconds) => {
    const M = Math.floor(totalSeconds / 60);
    const S = totalSeconds % 60;
    return `${M.toString().padStart(2, "0")}:${S.toString().padStart(2, "0")}`;
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

  // Cập nhật các biến màu để bao gồm cả class cho dark mode
  const cardBorderColor =
    mode === "work"
      ? "border-sky-500 dark:border-sky-400"
      : mode === "shortBreak"
      ? "border-emerald-500 dark:border-emerald-400"
      : "border-amber-500 dark:border-amber-400";

  return (
    // Container chính của Pomodoro Timer
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl sm:p-8 text-center">
      <audio
        ref={audioRef}
        src="/sounds/notification.mp3" // Đảm bảo file này có trong thư mục public/sounds
        preload="auto"
        style={{ display: "none" }}></audio>

      {/* Nút yêu cầu quyền thông báo */}
      {notificationPermission === "default" && (
        <div className="mb-4 text-center">
          <button
            onClick={requestNotificationPermission}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-400 dark:hover:bg-yellow-500 text-slate-800 dark:text-slate-900 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-yellow-400 dark:focus:ring-yellow-300 transition duration-150 ease-in-out">
            Bật Thông Báo Desktop
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Để nhận thông báo khi hết mỗi phiên.
          </p>
        </div>
      )}
      {notificationPermission === "denied" && (
        <p className="text-xs text-red-500 dark:text-red-400 text-center mb-4">
          Bạn đã tắt thông báo. Hãy vào cài đặt trình duyệt để bật lại.
        </p>
      )}

      {/* Card hiển thị thời gian chính */}
      <div
        className={`
          text-center p-6 sm:p-8 
          border-4 ${cardBorderColor} 
          rounded-2xl 
          max-w-sm w-full 
          mx-auto 
          bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm 
          shadow-2xl dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)]
          transition-colors duration-300 ease-in-out
        `}>
        {/* Tiêu đề mode và Focus Task Name */}
        <div className="mb-3 sm:mb-4">
          {" "}
          {/* Giảm margin bottom một chút */}
          <h2
            className={`
            ${
              mode === "work"
                ? "text-pink-300 dark:text-pink-400"
                : mode === "shortBreak"
                ? "text-emerald-400 dark:text-emerald-500"
                : "text-amber-400 dark:text-amber-500"
            }
            text-lg sm:text-xl font-semibold tracking-tight
            transition-colors duration-300 ease-in-out
          `}>
            {displayModeLabel}
          </h2>
          {mode === "work" && focusTaskName && (
            <p className="text-xs sm:text-sm text-white/70 dark:text-white/60 mt-1 italic">
              Đang tập trung:{" "}
              <span className="font-medium not-italic">{focusTaskName}</span>
            </p>
          )}
        </div>

        <div
          className={`
            text-[clamp(3.5rem,18vw,6rem)] 
            font-mono font-extrabold 
            text-slate-800 dark:text-slate-100
            my-6 sm:my-8 
            py-4  
            bg-slate-100/80 dark:bg-slate-700/60
            rounded-lg 
            shadow-inner dark:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.2)]
          `}>
          {displayTime}
        </div>

        {/* THÊM HIỂN THỊ THỜI GIAN ĐÃ TRÔI QUA (CURRENT) */}
        <div className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-6 -mt-4 sm:-mt-6">
          Current: {formatElapsedSessionTime(elapsedSecondsInSession)}
        </div>

        {/* Các nút điều khiển */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-5">
          <button
            onClick={handleStartPause}
            title={isActive ? "Tạm dừng" : "Bắt đầu"}
            className="p-4 sm:p-5 bg-white/20 dark:bg-black/30 hover:bg-white/30 dark:hover:bg-black/40 rounded-full transition-colors duration-200 text-dark dark:text-white text-2xl sm:text-3xl font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 dark:focus:ring-offset-transparent"
            style={{ width: "80px", height: "80px", lineHeight: "normal" }} // Làm nút Start to hơn
          >
            {isActive ? (
              <PauseSolidIcon className="w-8 h-8 sm:w-10 sm:h-10 " />
            ) : (
              <PlaySolidIcon className="w-8 h-8 sm:w-10 sm:h-10 " />
            )}
          </button>

          <button
            onClick={handleReset}
            title="Reset"
            className="p-3 sm:p-4 bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 dark:focus:ring-offset-transparent">
            <ArrowPathIcon className="w-5 h-5 sm:w-6 sm:h-6 text-dark dark:text-white" />
          </button>

          <button
            onClick={handleSkipSession}
            title="Bỏ qua phiên"
            className="p-3 sm:p-4 bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 dark:focus:ring-offset-transparent">
            <ForwardIcon className="w-5 h-5 sm:w-6 sm:h-6 text-dark dark:text-white" />
          </button>

          {/* Nút mở cài đặt Pomodoro (có thể đặt ở đây hoặc trên thanh công cụ chung) */}
          {/* Hiện tại mình tạm ẩn đi, vì sẽ có icon Settings trên thanh công cụ chung */}
          {/* <button 
        onClick={handleOpenTimerSettings} 
        title="Cài đặt Timer"
        className="absolute top-4 right-4 p-2 bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 rounded-full transition-colors"
      >
        <SettingsSolidIcon className="w-5 h-5 text-white" />
      </button> */}
        </div>

        {/* Hiển thị số Pomodoro đã hoàn thành */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-base">
            Đã hoàn thành:{" "}
            <span className="font-bold text-lg text-slate-700 dark:text-slate-300">
              {pomodoroCount}
            </span>{" "}
            / {settings.pomodorosPerLongBreak} Pomodoro
          </p>
        </div>

        {/* Khu vực cài đặt */}
        <div className="mt-8 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl dark:shadow-lg rounded-2xl max-w-md w-full text-slate-700 dark:text-slate-300">
          <h3 className="text-xl font-semibold text-center mb-6 text-sky-700 dark:text-sky-500">
            Tùy Chỉnh Pomodoro
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Input cho Work duration */}
            <div>
              <label
                htmlFor="work"
                className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
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
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
              />
            </div>
            {/* Input cho Short Break */}
            <div>
              <label
                htmlFor="shortBreak"
                className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
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
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
              />
            </div>
            {/* Input cho Long Break */}
            <div>
              <label
                htmlFor="longBreak"
                className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
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
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
              />
            </div>
            {/* Input cho Pomodoros per Long Break */}
            <div>
              <label
                htmlFor="pomodorosPerLongBreak"
                className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
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
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
              />
            </div>
          </div>
          <button
            onClick={() => {
              const defaultSettings = {
                work: 25,
                shortBreak: 5,
                longBreak: 15,
                pomodorosPerLongBreak: 4,
              };
              setSettings(defaultSettings); // Reset về giá trị mặc định trong code
              // Sau khi setSettings, useEffect sẽ tự động cập nhật lại minutes, seconds và gọi handleReset nếu cần
              // Hoặc gọi handleReset ngay tại đây để đảm bảo timer được reset theo giá trị mới ngay lập tức
              clearInterval(intervalRef.current);
              setIsActive(false);
              setMode("work");
              setMinutes(defaultSettings.work);
              setSeconds(0);
              setPomodoroCount(0);
            }}
            className="mt-6 w-full py-2 px-4 bg-slate-500 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-slate-400 dark:focus:ring-slate-500 transition duration-150">
            Đặt Lại Mặc Định
          </button>
        </div>
      </div>
    </div>
  );
}

export default PomodoroTimer;
