const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const { authenticate } = require("../../middlewares/auth.middleware");

// Tất cả route cần đăng nhập
router.use(authenticate);

// POST /payments/vnpay - Tạo URL thanh toán VNPAY
router.post("/vnpay", paymentController.createVnpayPayment);

// GET /payments/vnpay-return - Callback từ VNPAY (không cần auth vì VNPAY gọi về)
router.get("/vnpay-return", paymentController.handleVnpayReturn);

// GET /payments/:orderId - Lấy thông tin thanh toán
router.get("/:orderId", paymentController.getPayment);

module.exports = router;
