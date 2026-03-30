const express = require("express");
const router = express.Router();
const addressController = require("./address.controller");
const { authenticate } = require("../../middlewares/auth.middleware");

// Get all addresses of current user
router.get("/", authenticate, addressController.getAddresses);

// Create a new address
router.post("/", authenticate, addressController.createAddress);

// Update an address (e.g. set default)
router.put("/:id", authenticate, addressController.updateAddress);

// Soft delete address
router.delete("/:id", authenticate, addressController.deleteAddress);

module.exports = router;
