const app = require("./app");
const pool = require("./database/connection");

const PORT = process.env.PORT || 3000;

// Hàm khởi động server và kiểm tra kết nối cơ sở dữ liệu trước khi lắng nghe cổng.
const startServer = async () => {
  try {
    // Kiểm tra kết nối database để phát hiện lỗi cấu hình sớm.
    const connection = await pool.getConnection();
    console.log("✓ Kết nối Database thành công");
    connection.release();

    // Khởi chạy server sau khi kết nối DB thành công.
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