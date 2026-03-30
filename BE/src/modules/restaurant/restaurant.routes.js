const express = require("express");
const router = express.Router();
const restaurantController = require("./restaurant.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

// Public routes
router.get("/restaurants", restaurantController.list);
router.get("/restaurants/:id", restaurantController.detail);

// Admin approve route
router.put(
  "/admin/restaurants/:id/approve",
  authenticate,
  authorize("ADMIN"),
  restaurantController.approve
);

module.exports = router;
