const express = require("express");
const router = express.Router();

// Import routes modules
const { authRoutes } = require("../modules/auth");
const restaurantRoutes = require("../modules/restaurant/restaurant.routes");

// Health check
router.get("/health", (req, res) => {
  res.json({ message: "API endpoints are working" });
});

// Mount routes
router.use("/v1/auth", authRoutes);
// Restaurants (public + admin)
router.use("/v1", restaurantRoutes);

module.exports = router;
