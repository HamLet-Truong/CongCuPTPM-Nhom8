const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const { authenticate } = require("../../middlewares/auth.middleware");

router.get("/me", authenticate, userController.getProfile);

module.exports = router;
