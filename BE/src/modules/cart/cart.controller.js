const cartService = require("./cart.service");

class CartController {
  async getCart(req, res, next) {
    try {
      const userId = req.user.id;
      const items = await cartService.getCart(userId);
      res.status(200).json({
        success: true,
        data: items
      });
    } catch (error) {
      next(error);
    }
  }

  async addToCart(req, res, next) {
    try {
      const userId = req.user.id;
      const item = await cartService.addToCart(userId, req.body);
      res.status(201).json({
        success: true,
        message: "Thêm vào giỏ hàng thành công",
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCartItem(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const item = await cartService.updateCartItem(userId, id, req.body);
      res.status(200).json({
        success: true,
        message: "Cập nhật giỏ hàng thành công",
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  async removeCartItem(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await cartService.removeCartItem(userId, id);
      res.status(200).json({
        success: true,
        message: "Xóa khỏi giỏ hàng thành công"
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
