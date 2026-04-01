const express = require("express");
const router = express.Router();
const walletController = require("./wallet.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

// Tất cả route cần đăng nhập với vai trò ADMIN
router.use(authenticate);
router.use(authorize("ADMIN"));

// GET /admin/wallet/withdrawals - Danh sách rút tiền chờ duyệt
router.get("/withdrawals", walletController.getPendingWithdrawals);

// PUT /admin/wallet/withdrawals/:id/approve - Duyệt rút tiền
router.put("/withdrawals/:id/approve", walletController.approveWithdrawal);

// PUT /admin/wallet/withdrawals/:id/reject - Từ chối rút tiền
router.put("/withdrawals/:id/reject", walletController.rejectWithdrawal);

module.exports = router;
