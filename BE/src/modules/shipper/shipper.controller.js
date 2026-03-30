const shipperService = require("./shipper.service");

class ShipperController {
  async getAvailableOrders(req, res, next) {
    try {
      const orders = await shipperService.getAvailableOrders();
      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentOrders(req, res, next) {
    try {
      const shipperId = req.user.id;
      const orders = await shipperService.getCurrentOrders(shipperId);
      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderHistory(req, res, next) {
    try {
      const shipperId = req.user.id;
      const orders = await shipperService.getOrderHistory(shipperId);
      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ShipperController();
