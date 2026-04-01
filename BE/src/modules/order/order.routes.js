const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");
const { authenticate } = require("../../middlewares/auth.middleware");

// ===================== USER ROUTES =====================
// Tất cả route đơn hàng cần đăng nhập
router.use(authenticate);

// USER: Lấy đơn hàng của mình
router.get("/me", orderController.getMyOrders);

// USER: Tạo đơn hàng
router.post("/", orderController.createOrder);

// USER: Chi tiết đơn hàng
router.get("/:id", orderController.getOrderDetail);

// USER: Hủy đơn hàng
router.put("/:id/cancel", orderController.cancelOrder);

module.exports = router;
