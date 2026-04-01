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

  // ===== ADMIN FUNCTIONS =====
  async getPendingShippers(req, res, next) {
    try {
      const shippers = await shipperService.getPendingShippers();
      res.status(200).json({
        success: true,
        data: shippers
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllShippers(req, res, next) {
    try {
      const shippers = await shipperService.getAllShippers();
      res.status(200).json({
        success: true,
        data: shippers
      });
    } catch (error) {
      next(error);
    }
  }

  async getShipperDetail(req, res, next) {
    try {
      const { id } = req.params;
      const shipper = await shipperService.getShipperDetail(id);
      res.status(200).json({
        success: true,
        data: shipper
      });
    } catch (error) {
      next(error);
    }
  }

  async approveShipper(req, res, next) {
    try {
      const { id } = req.params;
      const shipper = await shipperService.approveShipper(id);
      res.status(200).json({
        success: true,
        message: "Duyệt shipper thành công",
        data: shipper
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectShipper(req, res, next) {
    try {
      const { id } = req.params;
      const shipper = await shipperService.rejectShipper(id);
      res.status(200).json({
        success: true,
        message: "Từ chối shipper",
        data: shipper
      });
    } catch (error) {
      next(error);
    }
  }

  async lockShipper(req, res, next) {
    try {
      const { id } = req.params;
      const shipper = await shipperService.lockShipper(id);
      res.status(200).json({
        success: true,
        message: "Khóa shipper thành công",
        data: shipper
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ShipperController();
