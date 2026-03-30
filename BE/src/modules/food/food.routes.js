const express = require("express");
const router = express.Router();
const foodController = require("./food.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

// GET /foods - Public, can filter by ?nhaHangId=...
router.get("/", foodController.getAllFoods);

// Lọc middleware: Require Auth and Role: NHA_HANG for the following routes
router.use(authenticate);
router.use((req, res, next) => {
  if (req.user.loai_tai_khoan !== "NHA_HANG") {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền thực hiện thao tác này"
    });
  }
  next();
});

// POST /foods
router.post("/", foodController.createFood);

// PUT /foods/:id
router.put("/:id", foodController.updateFood);

// DELETE /foods/:id
router.delete("/:id", foodController.deleteFood);

module.exports = router;
