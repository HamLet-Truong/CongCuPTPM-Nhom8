const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");

// Bộ trung gian xác thực JWT lấy từ header: Authorization: Bearer <token>.
const verifyToken = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Thiếu token xác thực", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_jwt_secret");

    // Chuẩn hóa thông tin người dùng để controller/service dùng thống nhất 1 format.
    req.user = {
      id: payload.id || payload.userId || payload.sub,
      vai_tro: payload.vai_tro || payload.role || "USER",
      email: payload.email,
    };

    if (!req.user.id) {
      throw new AppError("Token không hợp lệ", 401);
    }

    return next();
  } catch {
    return next(new AppError("Token không hợp lệ hoặc đã hết hạn", 401));
  }
};

// Bộ trung gian kiểm tra vai trò (role) để đảm bảo phân quyền đúng theo spec.
const requireRoles = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError("Chưa xác thực người dùng", 401));
    }

    if (!roles.includes(req.user.vai_tro)) {
      return next(new AppError("Bạn không có quyền truy cập", 403));
    }

    return next();
  };
};

module.exports = {
  verifyToken,
  requireRoles,
};
