const express = require("express");
const router = express.Router();
const cartController = require("./cart.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

// Tất cả route yêu cầu đăng nhập với vai trò USER
router.use(authenticate);
router.use(authorize("USER"));

// GET /cart
router.get("/", cartController.getCart);

// POST /cart
router.post("/", cartController.addToCart);

// PUT /cart/:id
router.put("/:id", cartController.updateCartItem);

// DELETE /cart/:id
router.delete("/:id", cartController.removeCartItem);

module.exports = router;
