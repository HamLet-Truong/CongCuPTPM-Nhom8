const express = require("express");
const router = express.Router();

// Import routes modules (sẽ tạo sau)
// const userRoutes = require("./users");
// const restaurantRoutes = require("./restaurants");
// const orderRoutes = require("./orders");

// Health check
router.get("/health", (req, res) => {
  res.json({ message: "API endpoints are working" });
});

// Mount routes
// router.use("/users", userRoutes);
// router.use("/restaurants", restaurantRoutes);
// router.use("/orders", orderRoutes);

module.exports = router;
