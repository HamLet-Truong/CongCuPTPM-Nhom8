const jwt = require("jsonwebtoken");

/**
 * Middleware xác thực JWT từ header Authorization
 * Lấy token dạng: Authorization: Bearer <token>
 * Giải mã và đính kèm user vào req.user
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy token xác thực"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      vai_tro: decoded.vai_tro,
      loai_tai_khoan: decoded.loai_tai_khoan
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn"
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ"
      });
    }
    return res.status(401).json({
      success: false,
      message: "Xác thực thất bại"
    });
  }
};

/**
 * Middleware kiểm tra quyền truy cập theo vai trò
 * @param {...string} allowedRoles - Danh sách vai trò được phép
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Chưa xác thực người dùng"
      });
    }

    if (!allowedRoles.includes(req.user.vai_tro)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền thực hiện thao tác này"
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
