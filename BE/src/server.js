const app = require("./app");
const prisma = require("./config/prisma");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Test Prisma connection
    await prisma.$connect();
    console.log("✓ Kết nối Database thành công");

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
    console.error("  - DATABASE_URL trong .env có đúng không?");
    process.exit(1);
  }
};

startServer();