const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");
const { authenticate } = require("../../middlewares/auth.middleware");

// Tất cả route cần đăng nhập với vai trò NHA_HANG
router.use(authenticate);
router.use((req, res, next) => {
  if (req.user.loai_tai_khoan !== "NHA_HANG") {
    return res.status(403).json({
      success: false,
      message: "Chỉ nhà hàng mới có thể thực hiện thao tác này"
    });
  }
  next();
});

// Lấy đơn hàng của nhà hàng (chờ xác nhận hoặc tất cả)
router.get("/", orderController.getRestaurantOrders);

// Xác nhận đơn hàng
router.put("/:id/confirm", orderController.confirmOrder);

// Từ chối đơn hàng
router.put("/:id/reject", orderController.rejectOrder);

module.exports = router;
