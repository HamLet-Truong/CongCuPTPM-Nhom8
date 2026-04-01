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

  // ===== ADMIN FUNCTIONS =====
  async getPendingShippers() {
    return await shipperRepository.findPendingShippers();
  }

  async getAllShippers() {
    return await shipperRepository.findAllShippers();
  }

  async getShipperDetail(id) {
    if (!id) {
      const error = new Error("Shipper ID là bắt buộc");
      error.status = 400;
      throw error;
    }

    const shipper = await shipperRepository.findShipperById(id);
    if (!shipper) {
      const error = new Error("Shipper không tồn tại");
      error.status = 404;
      throw error;
    }
    return shipper;
  }

  async approveShipper(id) {
    if (!id) {
      const error = new Error("Shipper ID là bắt buộc");
      error.status = 400;
      throw error;
    }

    const shipper = await shipperRepository.findShipperById(id);
    if (!shipper) {
      const error = new Error("Shipper không tồn tại");
      error.status = 404;
      throw error;
    }

    if (shipper.trang_thai !== "CHO_DUYET") {
      const error = new Error(`Shipper ở trạng thái ${shipper.trang_thai}, không thể duyệt`);
      error.status = 400;
      throw error;
    }

    return await shipperRepository.approveShipper(id);
  }

  async rejectShipper(id) {
    if (!id) {
      const error = new Error("Shipper ID là bắt buộc");
      error.status = 400;
      throw error;
    }

    const shipper = await shipperRepository.findShipperById(id);
    if (!shipper) {
      const error = new Error("Shipper không tồn tại");
      error.status = 404;
      throw error;
    }

    return await shipperRepository.rejectShipper(id);
  }

  async lockShipper(id) {
    if (!id) {
      const error = new Error("Shipper ID là bắt buộc");
      error.status = 400;
      throw error;
    }

    const shipper = await shipperRepository.findShipperById(id);
    if (!shipper) {
      const error = new Error("Shipper không tồn tại");
      error.status = 404;
      throw error;
    }

    return await shipperRepository.lockShipper(id);
  }
}

module.exports = new ShipperService();
