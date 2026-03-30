require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

const pool = require("./database/connection");
const { errorResponse } = require("./utils/response");

// Khai báo middleware dùng chung.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint kiểm tra trạng thái server + database.
app.get("/health", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.json({
      success: true,
      data: {
        status: "OK",
        message: "Server và Database đang chạy bình thường",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return errorResponse(res, "Không thể kết nối Database", 500);
  }
});

// Endpoint mặc định của ứng dụng.
app.get("/", (req, res) => {
  res.json({
    success: true,
    data: {
      message: "API is running...",
    },
  });
});

// Gắn router tổng vào tiền tố /api.
const routes = require("./routes");
app.use("/api", routes);

// Bộ xử lý khi không tìm thấy route.
app.use((req, res) => {
  return errorResponse(res, "Route not found", 404);
});

// Bộ xử lý lỗi tập trung toàn ứng dụng.
app.use((err, req, res, next) => {
  console.error("Error:", err);
  return errorResponse(res, err.message || "Internal Server Error", err.status || 500);
});

module.exports = app;