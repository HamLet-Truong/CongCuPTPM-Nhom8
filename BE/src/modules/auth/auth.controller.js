const authService = require("./auth.service");

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const { loai_tai_khoan, id } = req.user;
      const result = await authService.getMe(loai_tai_khoan, id);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async registerRestaurant(req, res, next) {
    try {
      const result = await authService.registerRestaurant(req.body);

      return res.status(201).json({
        success: true,
        message: "Đăng ký nhà hàng thành công. Vui lòng chờ quản trị viên duyệt.",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async registerShipper(req, res, next) {
    try {
      const result = await authService.registerShipper(req.body);

      return res.status(201).json({
        success: true,
        message: "Đăng ký shipper thành công. Vui lòng chờ quản trị viên duyệt.",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
