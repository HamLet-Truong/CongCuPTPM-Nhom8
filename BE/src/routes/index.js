const express = require("express");
const router = express.Router();

// Import routes modules
const { authRoutes } = require("../modules/auth");
const reviewRoutes = require("../modules/review/review.routes");

// Endpoint kiểm tra nhanh trạng thái router.
router.get("/health", (req, res) => {
  res.json({ message: "API endpoints are working" });
});

// Mount routes
router.use("/v1/auth", authRoutes);

// API review: /api/reviews
router.use("/reviews", reviewRoutes);

module.exports = router;
