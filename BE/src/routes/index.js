const express = require("express");
const router = express.Router();

// Import routes modules
const { authRoutes } = require("../modules/auth");
const { userRoutes } = require("../modules/user");
const { addressRoutes } = require("../modules/address");
const restaurantRoutes = require("../modules/restaurant/restaurant.routes");
const { foodRoutes } = require("../modules/food");
const reviewRoutes = require("../modules/review/review.routes");
const { cartRoutes } = require("../modules/cart");
const { shipperRoutes } = require("../modules/shipper");
const { publicRouter: voucherPublicRoutes, adminRouter: voucherAdminRoutes } = require("../modules/voucher/voucherRoutes");

// Health check
router.get("/health", (req, res) => {
  res.json({ message: "API endpoints are working" });
});

// Mount routes
router.use("/v1/auth", authRoutes);
router.use("/v1/users", userRoutes);
router.use("/v1/addresses", addressRoutes);

// Restaurants (public + admin)
router.use("/v1", restaurantRoutes);
router.use("/v1/foods", foodRoutes);

// API review: /api/reviews
router.use("/reviews", reviewRoutes);

// Cart
router.use("/v1/cart", cartRoutes);

// Shipper
router.use("/v1/shipper", shipperRoutes);

// Voucher
router.use("/v1/vouchers", voucherPublicRoutes);
router.use("/v1/admin/vouchers", voucherAdminRoutes);

module.exports = router;
