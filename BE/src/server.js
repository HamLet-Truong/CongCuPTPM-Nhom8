const app = require("./app");
const pool = require("./database/connection");

const PORT = process.env.PORT || 3000;

// Function to start server
const startServer = async () => {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    console.log("✓ Kết nối Database thành công");
    connection.release();

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server chạy trên cổng ${PORT}`);
      console.log(`✓ Môi trường: ${process.env.NODE_ENV || "development"}`);
      console.log(`✓ Kiểm tra server: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("✗ Lỗi khởi động server:", error.message);
    console.error("✗ Vui lòng kiểm tra:");
    console.error("  - MySQL server đang chạy không?");
    console.error("  - Cấu hình database trong .env có đúng không?");
    process.exit(1);
  }
};

startServer();