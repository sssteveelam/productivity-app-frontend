import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import "./App.css";
import TodoPage from "./pages/TodoPage";

function App() {
  return (
    <Router>
      <div
        style={{
          padding: "10px",
          borderBottom: "1px solid #eee",
          marginBottom: "20px",
        }}>
        <nav>
          <Link
            to="/"
            style={{
              marginRight: "15px",
              textDecoration: "none",
              color: "#007bff",
            }}>
            Trang Chủ
          </Link>
          {/* Tạm thời để link Todo ở đây, sau này có thể chỉ hiển thị khi đã đăng nhập */}
          <Link
            to="/todo"
            style={{
              marginRight: "15px",
              textDecoration: "none",
              color: "#007bff",
            }}>
            Công Việc
          </Link>

          {/* Phần này có thể làm phức tạp hơn với Navbar component và AuthContext sau này */}
          {!localStorage.getItem("userToken") ? (
            <>
              <Link
                to="/login"
                style={{
                  marginRight: "15px",
                  textDecoration: "none",
                  color: "#007bff",
                }}>
                Đăng Nhập
              </Link>
              <Link
                to="/register"
                style={{ textDecoration: "none", color: "#007bff" }}>
                Đăng Ký
              </Link>
            </>
          ) : (
            <span
              style={{ float: "right", cursor: "pointer", color: "#dc3545" }}
              onClick={() => {
                localStorage.removeItem("userToken");
                // Điều hướng về trang login hoặc home, có thể cần window.location.href để force re-render App nếu cần
                window.location.href = "/login";
              }}>
              Đăng Xuất
            </span>
          )}
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/todo" element={<TodoPage />} />
      </Routes>
    </Router>
  );
}

export default App;
