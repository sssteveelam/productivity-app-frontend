import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import taskService from "../api/taskService";

export default function TodoPage() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState();
  const [newTaskText, setNewTaskText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm để lấy danh sách công việc
  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await taskService.getTasks();
      setTasks(response.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách công việc:", err);
      setError("Không thể tải danh sách công việc. Vui lòng thử lại.");
      // Nếu lỗi là do chưa đăng nhập (ví dụ 401), có thể điều hướng về trang login
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchTasks();
  }, [navigate]);

  // --- HÀM XỬ LÝ THÊM CÔNG VIỆC MỚI ---
  const handleAddTask = async (e) => {
    e.preventDefault();

    if (newTaskText.trim() === "") {
      setError("Nội dung công việc không được để trống.");
      return;
    }
    setError(null);

    try {
      const response = await taskService.createTask({ text: newTaskText });
      // Thêm công việc mới vào đầu danh sách hiện tại
      setTasks((prevTasks) => [response.data, ...prevTasks]);
      setNewTaskText("");
    } catch (err) {
      console.error("Lỗi khi thêm công việc:", err);
      setError("Không thể thêm công việc. Vui lòng thử lại.");
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        setError(
          "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
        );
        navigate("/login");
      }
    }
  };

  // --- HÀM XỬ LÝ THAY ĐỔI TRẠNG THÁI HOÀN THÀNH ---
  const handleToggleComplete = async (taskToUpdate) => {
    setError(null);

    try {
      const updatedTaskPayload = {
        isCompleted: !taskToUpdate.isCompleted,
      };

      const response = await taskService.updateTask(
        taskToUpdate._id,
        updatedTaskPayload
      );

      // Cập nhật lại task trong danh sách tasks state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskToUpdate._id ? response.data : task
        )
      );
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái công việc:", err);
      setError("Không thể cập nhật trạng thái công việc. Vui lòng thử lại.");
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        setError(
          "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
        );
        navigate("/login");
      }
    }
  };

  // --- HÀM XỬ LÝ XÓA CÔNG VIỆC ---
  const handleDeleteTask = async (taskId) => {
    // Tùy chọn: Thêm hộp thoại xác nhận trước khi xóa
    if (!window.confirm("Bạn có chắc chắn muốn xóa công việc này không?")) {
      return;
    }
    setError(null);

    try {
      await taskService.deleteTask(taskId);
      // Loại bỏ task đã xóa khỏi danh sách tasks state
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } catch (err) {
      console.error("Lỗi khi xóa công việc:", err);
      setError("Không thể xóa công việc. Vui lòng thử lại.");
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        setError(
          "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
        );
        navigate("/login");
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Đang tải danh sách công việc...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "30px auto",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 2px 15px rgba(0,0,0,0.1)",
        borderRadius: "10px",
        backgroundColor: "#fff",
      }}>
      <h1
        style={{
          textAlign: "center",
          color: "#2c3e50",
          marginBottom: "30px",
          fontSize: "2rem",
        }}>
        Công Việc Cần Làm
      </h1>

      <form
        onSubmit={handleAddTask}
        style={{ display: "flex", marginBottom: "30px" }}>
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Thêm một việc mới..."
          style={{
            flexGrow: 1,
            padding: "12px 15px",
            border: "2px solid #bdc3c7",
            borderRadius: "6px 0 0 6px",
            fontSize: "1rem",
            outline: "none", // Bỏ outline khi focus
          }}
        />
        <button
          type="submit"
          style={{
            padding: "12px 25px",
            backgroundColor: "#3498db",
            color: "white",
            border: "2px solid #3498db",
            borderRadius: "0 6px 6px 0",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "600",
            transition: "background-color 0.2s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#2980b9")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#3498db")
          }>
          Thêm
        </button>
      </form>

      {error && (
        <p
          style={{
            color: "#e74c3c",
            textAlign: "center",
            marginBottom: "20px",
            fontWeight: "500",
          }}>
          {error}
        </p>
      )}

      {tasks.length === 0 && !isLoading && !error && (
        <p
          style={{
            textAlign: "center",
            color: "#7f8c8d",
            fontSize: "1.1rem",
            marginTop: "40px",
            padding: "20px",
            backgroundColor: "#ecf0f1",
            borderRadius: "6px",
          }}>
          Tuyệt vời! Không có công việc nào cần làm. <br /> Hãy tận hưởng thời
          gian rảnh hoặc thêm việc mới nhé!
        </p>
      )}

      <ul style={{ listStyleType: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task._id}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "15px",
              borderBottom: "1px solid #ecf0f1",
              backgroundColor: task.isCompleted ? "#f9f9f9" : "#fff",
              transition: "background-color 0.3s ease",
            }}>
            <input
              type="checkbox"
              checked={task.isCompleted}
              onChange={() => handleToggleComplete(task)} // Truyền cả object task
              style={{
                marginRight: "15px",
                cursor: "pointer",
                transform: "scale(1.3)", // Làm checkbox to hơn một chút
                accentColor: "#2ecc71", // Màu của checkbox khi được chọn
              }}
            />
            <span
              style={{
                textDecoration: task.isCompleted ? "line-through" : "none",
                color: task.isCompleted ? "#95a5a6" : "#34495e",
                fontSize: "1.1rem",
                flexGrow: 1,
                cursor: "pointer", // Thêm cursor pointer để người dùng biết có thể click
              }}
              onClick={() => handleToggleComplete(task)} // Cho phép click vào text để toggle
            >
              {task.text}
            </span>
            <button
              onClick={() => handleDeleteTask(task._id)}
              style={{
                marginLeft: "15px",
                backgroundColor: "transparent", // Nút xóa trong suốt hơn
                color: "#e74c3c",
                border: "1px solid #e74c3c",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "500",
                transition: "background-color 0.2s ease, color 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#e74c3c";
                e.currentTarget.style.color = "white";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#e74c3c";
              }}>
              Xóa
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
