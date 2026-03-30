const express = require("express");
const router = express.Router();
const shipperController = require("./shipper.controller");
const { authenticate } = require("../../middlewares/auth.middleware");

// Tất cả route yêu cầu xác thực và chỉ shipper được truy cập
router.use(authenticate);
router.use((req, res, next) => {
  if (req.user.loai_tai_khoan !== "SHIPPER") {
    return res.status(403).json({
      success: false,
      message: "Chỉ shipper được truy cập"
    });
  }
  next();
});

// GET /shipper/orders/available
router.get("/orders/available", shipperController.getAvailableOrders);

// GET /shipper/orders/history
router.get("/orders/history", shipperController.getOrderHistory);

// GET /shipper/orders
router.get("/orders", shipperController.getCurrentOrders);

module.exports = router;
