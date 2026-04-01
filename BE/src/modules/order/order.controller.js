const orderService = require("./order.service");

class OrderController {
  // USER: Lấy danh sách đơn hàng của mình
  async getMyOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const orders = await orderService.getOrdersByUser(userId);
      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  // USER: Lấy chi tiết đơn hàng
  async getOrderDetail(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.loai_tai_khoan;
      const { id } = req.params;

      const order = await orderService.getOrderById(id, userId, userRole);
      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // USER: Tạo đơn hàng
  async createOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const order = await orderService.createOrder(userId, req.body);
      res.status(201).json({
        success: true,
        message: "Tạo đơn hàng thành công",
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // USER: Hủy đơn hàng
  async cancelOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const order = await orderService.cancelOrder(id, userId);
      res.status(200).json({
        success: true,
        message: "Hủy đơn hàng thành công",
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // RESTAURANT: Lấy đơn hàng của nhà hàng
  async getRestaurantOrders(req, res, next) {
    try {
      const restaurantId = req.user.id;
      const { status } = req.query;

      let orders;
      if (status === "CHO_DUYET") {
        orders = await orderService.getPendingOrders(restaurantId);
      } else {
        orders = await orderService.getOrdersByRestaurant(restaurantId);
      }

      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  // RESTAURANT: Xác nhận đơn hàng
  async confirmOrder(req, res, next) {
    try {
      const restaurantId = req.user.id;
      const { id } = req.params;

      const order = await orderService.confirmOrder(id, restaurantId);
      res.status(200).json({
        success: true,
        message: "Xác nhận đơn hàng thành công",
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // RESTAURANT: Từ chối đơn hàng
  async rejectOrder(req, res, next) {
    try {
      const restaurantId = req.user.id;
      const { id } = req.params;

      const order = await orderService.rejectOrder(id, restaurantId);
      res.status(200).json({
        success: true,
        message: "Từ chối đơn hàng thành công",
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // SHIPPER: Lấy đơn hàng khả dụng
  async getAvailableOrders(req, res, next) {
    try {
      const orders = await orderService.getAvailableOrdersForShipper();
      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  // SHIPPER: Lấy đơn hàng hiện tại
  async getCurrentOrders(req, res, next) {
    try {
      const shipperId = req.user.id;
      const orders = await orderService.getShipperCurrentOrders(shipperId);
      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  // SHIPPER: Nhận đơn hàng
  async acceptOrder(req, res, next) {
    try {
      const shipperId = req.user.id;
      const { id } = req.params;

      const order = await orderService.acceptOrder(id, shipperId);
      res.status(200).json({
        success: true,
        message: "Nhận đơn hàng thành công",
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // SHIPPER: Bắt đầu lấy hàng
  async startPickup(req, res, next) {
    try {
      const shipperId = req.user.id;
      const { id } = req.params;

      const order = await orderService.startPickup(id, shipperId);
      res.status(200).json({
        success: true,
        message: "Bắt đầu lấy hàng",
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // SHIPPER: Bắt đầu giao hàng
  async startDelivery(req, res, next) {
    try {
      const shipperId = req.user.id;
      const { id } = req.params;

      const order = await orderService.startDelivery(id, shipperId);
      res.status(200).json({
        success: true,
        message: "Bắt đầu giao hàng",
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // SHIPPER: Hoàn thành giao hàng
  async completeDelivery(req, res, next) {
    try {
      const shipperId = req.user.id;
      const { id } = req.params;

      const order = await orderService.completeDelivery(id, shipperId);
      res.status(200).json({
        success: true,
        message: "Giao hàng thành công",
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  // SHIPPER: Lịch sử đơn hàng
  async getOrderHistory(req, res, next) {
    try {
      const shipperId = req.user.id;
      const orders = await orderService.getShipperHistory(shipperId);
      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
