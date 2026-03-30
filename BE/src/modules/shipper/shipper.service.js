const shipperRepository = require("./shipper.repository");

class ShipperService {
  async getAvailableOrders() {
    return await shipperRepository.findAvailableOrders();
  }

  async getCurrentOrders(shipperId) {
    if (!shipperId) {
      const error = new Error("Shipper ID là bắt buộc");
      error.status = 400;
      throw error;
    }
    return await shipperRepository.findCurrentOrders(shipperId);
  }

  async getOrderHistory(shipperId) {
    if (!shipperId) {
      const error = new Error("Shipper ID là bắt buộc");
      error.status = 400;
      throw error;
    }
    return await shipperRepository.findOrderHistory(shipperId);
  }
}

module.exports = new ShipperService();
