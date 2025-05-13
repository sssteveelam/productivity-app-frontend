import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import taskService from "../api/taskService";
import PomodoroTimer from "../components/PomodoroTimer"; // Điều chỉnh đường dẫn nếu cần

export default function TodoPage() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState();
  const [newTaskText, setNewTaskText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await taskService.getTasks();
      setTasks(response.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách công việc:", err);
      setError("Không thể tải danh sách công việc. Vui lòng thử lại.");
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

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (newTaskText.trim() === "") {
      setError("Nội dung công việc không được để trống.");
      return;
    }
    setError(null);

    try {
      const response = await taskService.createTask({ text: newTaskText });
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

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa công việc này không?")) {
      return;
    }
    setError(null);

    try {
      await taskService.deleteTask(taskId);
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="text-center text-gray-700 text-xl font-semibold flex items-center">
          <svg
            className="animate-spin h-6 w-6 mr-3 text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Đang tải danh sách công việc...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center p-4 sm:p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-6">
        <PomodoroTimer />

        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mt-4 mb-6">
          Danh Sách Công Việc
        </h1>

        <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Thêm một việc mới..."
            className="flex-grow px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                       transition duration-200 ease-in-out text-base"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                       transition duration-200 ease-in-out text-base disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}>
            Thêm
          </button>
        </form>

        {error && (
          <p className="text-red-600 text-base font-medium italic text-center mb-4">
            {error}
          </p>
        )}

        {tasks && tasks.length === 0 && !isLoading && !error && (
          <div className="text-center text-gray-600 text-lg italic p-6 bg-gray-50 rounded-lg shadow-inner">
            Tuyệt vời! Không có công việc nào cần làm. <br /> Hãy tận hưởng thời
            gian rảnh hoặc thêm việc mới nhé!
          </div>
        )}

        {tasks && tasks.length > 0 && (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task._id}
                className={`flex items-center p-4 border border-gray-200 rounded-lg shadow-sm
                           transition-all duration-300 ease-in-out
                           ${
                             task.isCompleted
                               ? "bg-green-50 border-green-200"
                               : "bg-white hover:shadow-md"
                           }`}>
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => handleToggleComplete(task)}
                  className="form-checkbox h-5 w-5 text-green-600 rounded border-gray-300 cursor-pointer focus:ring-green-500"
                />
                <span
                  className={`flex-grow ml-4 text-lg cursor-pointer
                             ${
                               task.isCompleted
                                 ? "line-through text-gray-500 italic"
                                 : "text-gray-800"
                             }`}
                  onClick={() => handleToggleComplete(task)}>
                  {task.text}
                </span>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="ml-4 px-3 py-1 text-sm font-medium text-red-600 border border-red-600 rounded-md
                             hover:bg-red-600 hover:text-white transition duration-200 ease-in-out
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
