const express = require("express");
const router = express.Router();

// Nạp route review theo kiến trúc module.
const reviewRoutes = require("../modules/review/review.routes");

// Nạp các module route khác (sẽ bổ sung sau).
// const userRoutes = require("./users");
// const restaurantRoutes = require("./restaurants");
// const orderRoutes = require("./orders");

// Endpoint kiểm tra nhanh trạng thái router.
router.get("/health", (req, res) => {
  res.json({ message: "API endpoints are working" });
});

// Gắn các route con.
// router.use("/users", userRoutes);
// router.use("/restaurants", restaurantRoutes);
// router.use("/orders", orderRoutes);

// API review: /api/reviews
router.use("/reviews", reviewRoutes);

module.exports = router;
