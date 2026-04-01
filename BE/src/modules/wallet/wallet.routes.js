const express = require("express");
const router = express.Router();
const walletController = require("./wallet.controller");
const { authenticate } = require("../../middlewares/auth.middleware");

// Tất cả route cần đăng nhập
router.use(authenticate);

// GET /wallet - Lấy thông tin ví
router.get("/", walletController.getWallet);

// POST /wallet/deposit - Nạp tiền
router.post("/deposit", walletController.deposit);

// POST /wallet/withdraw - Rút tiền
router.post("/withdraw", walletController.withdraw);

module.exports = router;
