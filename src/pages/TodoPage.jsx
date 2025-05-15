import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import taskService from "../api/taskService";
import PomodoroTimer from "../components/PomodoroTimer"; // Điều chỉnh đường dẫn nếu cần

export default function TodoPage() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState();
  const [newTaskText, setNewTaskText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // --- STATE - CÔNG VIỆC ĐANG TẬP TRUNG ---
  const [currentFocusTask, setCurrentFocusTask] = useState(null); // Lưu trữ object task hoặc null

  // --- STATE MỚI CHO CHỨC NĂNG SỬA ---
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState("");

  const editInputRef = useRef(null);

  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select(); // Chọn toàn bộ text để dễ dàng ghi đè
    }
  }, [editingTaskId]);

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

      // Nếu task đang focus được đánh dấu hoàn thành, có thể bỏ focus nó đi
      if (
        currentFocusTask &&
        currentFocusTask._id === taskToUpdate._id &&
        response.data.isCompleted
      ) {
        setCurrentFocusTask(null);
      }
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

      // Nếu task đang focus bị xóa, bỏ focus
      if (currentFocusTask && currentFocusTask._id === taskId) {
        setCurrentFocusTask(null);
      }
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

  // --- HÀM ĐẶT CÔNG VIỆC TẬP TRUNG ---
  const handleSetFocusTask = (task) => {
    if (task.isCompleted) {
      alert(
        "Công việc này đã hoàn thành, không thể đặt làm mục tiêu tập trung."
      );
      return;
    }

    setCurrentFocusTask(task);
  };

  // --- HÀM BỎ CHỌN CÔNG VIỆC TẬP TRUNG ---
  const handleClearFocusTask = () => {
    setCurrentFocusTask(null);
  };

  // --- CÁC HÀM CHO CHỨC NĂNG SỬA ---
  const handleStartEdit = (task) => {
    if (task.isCompleted) {
      alert("Không thể sửa công việc đã hoàn thành.");
      return;
    }

    setEditingTaskId(task._id);
    setEditText(task.text);

    // Nếu đang focus task khác, bỏ focus
    if (currentFocusTask && currentFocusTask._id !== task._id) {
      setCurrentFocusTask(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditText("");
  };

  const handleSaveEdit = async () => {
    if (!editingTaskId) return;

    const trimmedEditText = editText.trim();

    if (trimmedEditText === "") {
      setError("Nội dung công việc không được để trống khi sửa.");
      return;
    }
    setError(null);

    // Tìm task gốc để so sánh, tránh gọi API nếu text không đổi
    const originalTask = tasks.find((t) => t._id === editingTaskId);
    if (originalTask && originalTask.text === trimmedEditText) {
      handleCancelEdit(); // Text không đổi, chỉ cần thoát chế độ sửa
      return;
    }

    try {
      const response = await taskService.updateTask(editingTaskId, {
        text: trimmedEditText,
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === editingTaskId ? response.data : task
        )
      );

      // Nếu task đang focus được sửa tên, cập nhật lại currentFocusTask
      if (currentFocusTask && currentFocusTask._id === editingTaskId) {
        setCurrentFocusTask(response.data);
      }
      // Thoát chế độ sửa sau khi lưu thành công
      handleCancelEdit();
    } catch (err) {
      console.error("Lỗi khi lưu công việc:", err);
      setError("Không thể lưu thay đổi. Vui lòng thử lại.");
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

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
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
        {/* Pomodoro Timer và thông tin task đang focus */}
        <div className="w-full ">
          {" "}
          {/* Container cho Pomodoro và info focus task */}
          <PomodoroTimer
            focusTaskName={currentFocusTask ? currentFocusTask.text : null}
          />
          {currentFocusTask && (
            <div className="mt-4 p-3 bg-indigo-100 border border-indigo-300 rounded-lg text-center shadow">
              <p className="text-sm text-indigo-700">Đang tập trung vào:</p>
              <p className="font-semibold text-indigo-800 text-lg">
                {currentFocusTask.text}
              </p>
              <button
                onClick={handleClearFocusTask}
                className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 underline">
                Bỏ chọn
              </button>
            </div>
          )}
          {!currentFocusTask && (
            <p className="mt-4 text-center text-gray-600 italic">
              Chọn một công việc bên dưới để bắt đầu tập trung!
            </p>
          )}
        </div>

        {/* Phần To-Do List */}

        <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6">
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
        </div>

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

        {tasks.length > 0 && (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task._id}
                className={`flex items-center p-3 sm:p-4 border rounded-lg shadow-sm
                            transition-all duration-300 ease-in-out 
                            ${
                              task.isCompleted
                                ? "bg-green-50 border-green-200 opacity-70"
                                : currentFocusTask &&
                                  currentFocusTask._id === task._id &&
                                  editingTaskId !== task._id
                                ? "bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300"
                                : editingTaskId === task._id
                                ? "bg-yellow-50 border-yellow-300 ring-2 ring-yellow-200" // Highlight task đang sửa
                                : "bg-white hover:shadow-lg border-gray-200"
                            }`}>
                {editingTaskId === task._id ? (
                  // --- GIAO DIỆN KHI ĐANG SỬA ---
                  <>
                    <input
                      ref={editInputRef} // Gắn ref vào đây
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={handleEditKeyDown} // Xử lý Enter/Escape
                      className="flex-grow px-3 py-2 border border-indigo-400 rounded-md shadow-sm 
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="ml-2 px-3 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-md shadow-sm">
                      Lưu
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="ml-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md shadow-sm">
                      Hủy
                    </button>
                  </>
                ) : (
                  // --- GIAO DIỆN XEM BÌNH THƯỜNG ---
                  <>
                    <input
                      type="checkbox"
                      checked={task.isCompleted}
                      onChange={() => handleToggleComplete(task)}
                      disabled={!!editingTaskId} // Vô hiệu hóa khi đang sửa task khác
                      className="form-checkbox h-5 w-5 sm:h-6 sm:w-6 text-green-600 rounded border-gray-300 cursor-pointer focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span
                      className={`flex-grow ml-3 sm:ml-4 text-base sm:text-lg 
                                  ${
                                    task.isCompleted
                                      ? "line-through text-gray-400 italic"
                                      : currentFocusTask &&
                                        currentFocusTask._id === task._id
                                      ? "text-indigo-700 font-semibold cursor-pointer"
                                      : "text-gray-800 cursor-pointer"
                                  }`}
                      onClick={() =>
                        !task.isCompleted &&
                        !editingTaskId &&
                        handleSetFocusTask(task)
                      } // Chỉ cho focus khi không sửa task khác
                    >
                      {task.text}
                    </span>

                    {!task.isCompleted && (
                      <>
                        {(!currentFocusTask ||
                          currentFocusTask._id !== task._id) && (
                          <button
                            onClick={() => {
                              if (editingTaskId) handleCancelEdit();
                              handleSetFocusTask(task);
                            }}
                            disabled={
                              !!editingTaskId && editingTaskId !== task._id
                            } // Vô hiệu hóa khi đang sửa task khác
                            className="ml-2 sm:ml-4 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md
                                       hover:bg-indigo-600 hover:text-white transition duration-200 ease-in-out
                                       focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500
                                       disabled:opacity-50 disabled:cursor-not-allowed">
                            Tập trung
                          </button>
                        )}
                        {currentFocusTask &&
                          currentFocusTask._id === task._id && (
                            <span className="ml-2 sm:ml-4 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold text-white bg-indigo-500 rounded-md">
                              Đang Focus
                            </span>
                          )}
                        <button
                          onClick={() => handleStartEdit(task)}
                          disabled={!!editingTaskId} // Vô hiệu hóa khi đang sửa task khác
                          className="ml-2 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-yellow-600 border border-yellow-600 rounded-md
                                     hover:bg-yellow-600 hover:text-white transition duration-200 ease-in-out
                                     focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-yellow-500
                                     disabled:opacity-50 disabled:cursor-not-allowed">
                          Sửa
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      disabled={!!editingTaskId && editingTaskId !== task._id} // Vô hiệu hóa khi đang sửa task khác
                      className="ml-2 sm:ml-4 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-red-600 border border-red-600 rounded-md
                                 hover:bg-red-600 hover:text-white transition duration-200 ease-in-out
                                 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500
                                 disabled:opacity-50 disabled:cursor-not-allowed">
                      Xóa
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
