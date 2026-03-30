const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { authenticate } = require("../../middlewares/auth.middleware");

// Nguoi dung
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authenticate, authController.getMe);

// Nha hang
router.post("/register-restaurant", authController.registerRestaurant);

// Shipper
router.post("/register-shipper", authController.registerShipper);

module.exports = router;
