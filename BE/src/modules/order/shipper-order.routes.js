const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");
const { authenticate } = require("../../middlewares/auth.middleware");

// Tất cả route cần đăng nhập với vai trò SHIPPER
router.use(authenticate);
router.use((req, res, next) => {
  if (req.user.loai_tai_khoan !== "SHIPPER") {
    return res.status(403).json({
      success: false,
      message: "Chỉ shipper mới có thể thực hiện thao tác này"
    });
  }
  next();
});

// Lấy đơn hàng khả dụng cho shipper
router.get("/orders/available", orderController.getAvailableOrders);

// Lấy đơn hàng hiện tại của shipper
router.get("/orders", orderController.getCurrentOrders);

// Lịch sử đơn hàng
router.get("/orders/history", orderController.getOrderHistory);

// Nhận đơn hàng
router.post("/orders/:id/accept", orderController.acceptOrder);

// Bắt đầu lấy hàng
router.put("/orders/:id/pickup", orderController.startPickup);

// Bắt đầu giao hàng
router.put("/orders/:id/deliver", orderController.startDelivery);

// Hoàn thành giao hàng
router.put("/orders/:id/complete", orderController.completeDelivery);

module.exports = router;
