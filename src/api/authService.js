// src/api/authService.js
import axios from "axios";

// Địa chỉ cơ sở của backend API
const API_URL = "http://localhost:5001/api/auth/";

// Hàm đăng ký người dùng
const register = (email, password, username) => {
  return axios.post(API_URL + "register", {
    email,
    password,
    username,
  });
};

// Hàm đăng nhập người dùng
const login = (email, password) => {
  return axios.post(API_URL + "login", {
    email,
    password,
  });
};

const authService = {
  register,
  login,
};

export default authService;
