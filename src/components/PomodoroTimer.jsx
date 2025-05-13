// src/components/PomodoroTimer.jsx
import React, { useState, useEffect, useRef } from "react"; // Thêm useRef

const WORK_DURATION_MINUTES = 25;
const SHORT_BREAK_DURATION_MINUTES = 5;
// const LONG_BREAK_DURATION_MINUTES = 15;
// const POMODOROS_PER_LONG_BREAK = 4;

function PomodoroTimer() {
  const [minutes, setMinutes] = useState(WORK_DURATION_MINUTES);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("work"); // 'work', 'shortBreak'
  // const [pomodoroCount, setPomodoroCount] = useState(0); // Đếm số Pomodoro

  // Sử dụng useRef để lưu trữ interval ID, giúp việc clear interval chính xác hơn
  // đặc biệt khi state thay đổi nhiều lần.
  const intervalRef = useRef(null);

  // Hàm để chuyển đổi phiên
  const switchMode = () => {
    setIsActive(false); // Dừng timer trước khi chuyển
    if (mode === "work") {
      setMode("shortBreak");
      setMinutes(SHORT_BREAK_DURATION_MINUTES);
      // setPomodoroCount(prevCount => prevCount + 1); // Tăng số Pomodoro
      alert("Hết giờ làm việc! Bắt đầu nghỉ ngắn.");
    } else {
      // 'shortBreak' (hoặc 'longBreak' sau này)
      setMode("work");
      setMinutes(WORK_DURATION_MINUTES);
      alert("Hết giờ nghỉ! Quay lại làm việc thôi.");
    }
    setSeconds(0);
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds > 0) {
            return prevSeconds - 1;
          } else {
            // prevSeconds === 0
            setMinutes((prevMinutes) => {
              if (prevMinutes > 0) {
                return prevMinutes - 1;
              } else {
                // prevMinutes === 0 && prevSeconds === 0 (tức là đã được setSeconds(0) ở trên)
                // Hết giờ
                clearInterval(intervalRef.current); // Dừng interval hiện tại

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

  // Một useEffect riêng để xử lý khi thời gian về 00:00
  useEffect(() => {
    if (isActive && minutes === 0 && seconds === 0) {
      // Đã hết giờ, timer vẫn đang active (sẽ được set thành false trong switchMode)
      // Thêm một chút delay nhỏ để đảm bảo state seconds được cập nhật trước khi switchMode
      // hoặc không cần delay nếu switchMode không phụ thuộc vào giá trị seconds tức thời.
      switchMode();
    }
    // Phụ thuộc vào minutes và seconds để kiểm tra khi nào hết giờ.
    // Phụ thuộc vào isActive để chỉ kiểm tra khi timer đang chạy.
  }, [minutes, seconds, isActive, mode]); // Thêm mode để có thể reset đúng

  const handleStartPause = () => {
    if (minutes === 0 && seconds === 0 && !isActive) {
      // Nếu timer đã ở 00:00 và không active (tức là vừa hết một phiên)
      // thì không làm gì ở đây, việc reset thời gian cho phiên mới đã được switchMode xử lý.
      // Người dùng chỉ cần nhấn Start để bắt đầu phiên mới với thời gian đã được thiết lập.
      // Nếu muốn tự động start, logic sẽ khác.
      // Hiện tại, nếu 00:00, nút "Start" sẽ bắt đầu timer (nếu thời gian đã được reset cho phiên mới)
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current); // Dừng interval hiện tại
    setIsActive(false);
    setMode("work");
    setMinutes(WORK_DURATION_MINUTES);
    setSeconds(0);
    // setPomodoroCount(0);
  };

  const displayTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
  const displayModeLabel =
    mode === "work" ? "Thời Gian Làm Việc" : "Thời Gian Nghỉ Ngắn";

  return (
    <div
      style={{
        textAlign: "center",
        padding: "30px",
        border: mode === "work" ? "3px solid #3498db" : "3px solid #2ecc71", // Viền màu theo mode
        borderRadius: "15px",
        maxWidth: "380px",
        margin: "40px auto",
        backgroundColor: "#fff",
        boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
      }}>
      <h2
        style={{
          color: mode === "work" ? "#3498db" : "#2ecc71",
          marginBottom: "15px",
          fontSize: "1.7rem",
          fontWeight: "600",
        }}>
        {displayModeLabel}
      </h2>
      <div
        style={{
          fontSize: "clamp(4rem, 15vw, 6.5rem)", // Font co giãn
          fontWeight: "bold",
          color: "#34495e",
          margin: "20px 0 30px 0",
          fontFamily: "'Segment7', 'Courier New', Courier, monospace", // Font giống đồng hồ số (cần import font nếu muốn)
        }}>
        {displayTime}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        <button
          onClick={handleStartPause}
          style={{
            padding: "15px 30px",
            fontSize: "1.2rem",
            backgroundColor: isActive
              ? "#f39c12"
              : mode === "work"
              ? "#3498db"
              : "#2ecc71",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            minWidth: "140px",
            fontWeight: "bold",
            boxShadow: "0 3px 5px rgba(0,0,0,0.1)",
            transition: "background-color 0.2s ease, transform 0.1s ease",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}>
          {isActive ? "Tạm Dừng" : "Bắt Đầu"}
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: "15px 30px",
            fontSize: "1.2rem",
            backgroundColor: "#95a5a6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 3px 5px rgba(0,0,0,0.1)",
            transition: "background-color 0.2s ease, transform 0.1s ease",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}>
          Reset
        </button>
      </div>
      {/* <p style={{marginTop: '25px', fontSize: '1.1rem', color: '#7f8c8d'}}>Đã hoàn thành: {pomodoroCount} Pomodoro</p> */}
    </div>
  );
}

export default PomodoroTimer;
