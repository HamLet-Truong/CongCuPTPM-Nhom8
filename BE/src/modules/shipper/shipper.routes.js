const express = require("express");
const router = express.Router();
const shipperController = require("./shipper.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

// ===== ADMIN ROUTES =====
// GET /admin/pending - Danh sách shipper chờ duyệt
router.get(
  "/admin/pending",
  authenticate,
  authorize("ADMIN"),
  shipperController.getPendingShippers
);

// GET /admin/list - Danh sách tất cả shipper
router.get(
  "/admin/list",
  authenticate,
  authorize("ADMIN"),
  shipperController.getAllShippers
);

// GET /admin/:id - Chi tiết shipper
router.get(
  "/admin/:id",
  authenticate,
  authorize("ADMIN"),
  shipperController.getShipperDetail
);

// PUT /admin/:id/approve - Duyệt shipper
router.put(
  "/admin/:id/approve",
  authenticate,
  authorize("ADMIN"),
  shipperController.approveShipper
);

// PUT /admin/:id/reject - Từ chối shipper
router.put(
  "/admin/:id/reject",
  authenticate,
  authorize("ADMIN"),
  shipperController.rejectShipper
);

// PUT /admin/:id/lock - Khóa shipper
router.put(
  "/admin/:id/lock",
  authenticate,
  authorize("ADMIN"),
  shipperController.lockShipper
);

// ===== SHIPPER ROUTES =====
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
