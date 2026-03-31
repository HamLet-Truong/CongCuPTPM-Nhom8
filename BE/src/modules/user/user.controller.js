const userService = require("./user.service");

class UserController {
  async getProfile(req, res, next) {
    try {
      if (req.user.loai_tai_khoan && req.user.loai_tai_khoan !== "USER") {
        return res.status(403).json({
          success: false,
          message: "Chỉ người dùng (USER) mới có thể lấy profile tại endpoint này"
        });
      }

      const userId = req.user.id;
      const result = await userService.getProfile(userId);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error.message === "Người dùng không tồn tại") {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}

module.exports = new UserController();
