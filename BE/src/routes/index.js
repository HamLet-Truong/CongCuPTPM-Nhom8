const express = require("express");
const router = express.Router();

// Import routes modules
const { authRoutes } = require("../modules/auth");
const restaurantRoutes = require("../modules/restaurant/restaurant.routes");
const { foodRoutes } = require("../modules/food");
const reviewRoutes = require("../modules/review/review.routes");
const { cartRoutes } = require("../modules/cart");
const { shipperRoutes } = require("../modules/shipper");
const { publicRouter: voucherPublicRoutes, adminRouter: voucherAdminRoutes } = require("../modules/voucher/voucherRoutes");
const { orderRoutes, restaurantOrderRoutes, shipperOrderRoutes } = require("../modules/order");
const { walletRoutes, adminWalletRoutes } = require("../modules/wallet");
const { paymentRoutes } = require("../modules/payment");

// Health check
router.get("/health", (req, res) => {
  res.json({ message: "API endpoints are working" });
});

// Mount routes
router.use("/v1/auth", authRoutes);
// Restaurants (public + admin)
router.use("/v1", restaurantRoutes);
router.use("/v1/foods", foodRoutes);

// API review: /api/reviews
router.use("/reviews", reviewRoutes);

// Cart
router.use("/v1/cart", cartRoutes);

// Order (User routes)
router.use("/v1/orders", orderRoutes);

// Restaurant Order (nhà hàng quản lý đơn)
router.use("/v1/restaurant/orders", restaurantOrderRoutes);

// Shipper Order (shipper nhận và giao đơn)
router.use("/v1/shipper", shipperOrderRoutes);

// Shipper (các route khác của shipper)
router.use("/v1/shipper", shipperRoutes);

// Wallet (User/Shipper)
router.use("/v1/wallet", walletRoutes);

// Voucher
router.use("/v1/vouchers", voucherPublicRoutes);
router.use("/v1/admin/vouchers", voucherAdminRoutes);

// Admin Wallet (quản lý rút tiền)
router.use("/v1/admin/wallet", adminWalletRoutes);

// Payment (VNPAY)
router.use("/v1/payments", paymentRoutes);

module.exports = router;
