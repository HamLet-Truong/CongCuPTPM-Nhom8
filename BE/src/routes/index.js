const express = require("express");
const router = express.Router();

// Import routes modules
const { authRoutes } = require("../modules/auth");
const restaurantRoutes = require("../modules/restaurant/restaurant.routes");
const { foodRoutes } = require("../modules/food");
const reviewRoutes = require("../modules/review/review.routes");

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

module.exports = router;
