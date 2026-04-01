const paymentService = require("./payment.service");

class PaymentController {
  // POST /payments/vnpay - Tạo URL thanh toán VNPAY
  async createVnpayPayment(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { don_hang_id } = req.body;

      const result = await paymentService.createVnpayUrl(userId, don_hang_id, req);

      res.status(200).json({
        success: true,
        message: "Tạo URL thanh toán thành công",
        data: {
          paymentUrl: result.paymentUrl,
          orderId: result.orderId,
          amount: result.amount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /payments/vnpay-return - Xử lý kết quả thanh toán
  async handleVnpayReturn(req, res, next) {
    try {
      const result = await paymentService.handleVnpayReturn(req.query);

      // Redirect về frontend với kết quả
      if (result.success) {
        // Redirect về frontend thành công
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(
          `${frontendUrl}/payment/success?orderId=${result.orderId}&amount=${result.amount}&transactionNo=${result.transactionNo || ""}`
        );
      } else {
        // Redirect về frontend thất bại
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(
          `${frontendUrl}/payment/failed?orderId=${result.orderId}&message=${encodeURIComponent(result.message)}`
        );
      }
    } catch (error) {
      next(error);
    }
  }

  // GET /payments/:orderId - Lấy thông tin thanh toán
  async getPayment(req, res, next) {
    try {
      const { orderId } = req.params;
      const payment = await paymentService.getPaymentByOrderId(orderId);

      res.status(200).json({
        success: true,
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
