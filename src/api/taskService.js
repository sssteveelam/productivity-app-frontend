import axios from "axios";

const API_URL = "http://localhost:5001/api/tasks/"; // Địa chỉ API tasks của backend

// Hàm lấy token từ localStorage
const getToken = () => {
  return localStorage.getItem("userToken");
};
// Tạo một instance của axios với cấu hình mặc định cho header Authorization
const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Lấy tất cả công việc của người dùng.
const getTasks = () => {
  return axiosInstance.get("/"); // (tức là /api/tasks/)
};

// Tạo một công việc mới
// taskData nên là một object, ví dụ: { text: "Nội dung công việc" }
const createTask = (taskData) => {
  return axiosInstance.post("/", taskData);
};

// Cập nhật một công việc
// taskId là ID của công việc
const updateTask = (taskId, updateData) => {
  return axiosInstance.put(`${taskId}`, updateData); // PUT API_URL/:taskId
};

// Xóa một công việc
const deleteTask = (taskId) => {
  return axiosInstance.delete(`/${taskId}`); // DELETE API_URL/:taskId
};

const taskService = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};

export default taskService;
