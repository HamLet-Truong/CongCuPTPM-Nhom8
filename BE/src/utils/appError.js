// AppError: lớp lỗi dùng chung để chuẩn hóa message + HTTP status cho toàn hệ thống.
class AppError extends Error {
  // Nếu không truyền status thì mặc định là lỗi server 500.
  constructor(message, status = 500) {
    super(message);
    this.name = "AppError";
    this.status = status;
    // Ghi lại stack trace bắt đầu từ AppError để debug dễ hơn.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
