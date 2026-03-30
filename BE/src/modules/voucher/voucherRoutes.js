const express = require('express');
const router = express.Router();
const voucherController = require('./voucherController');


// PUBLIC ROUTES (không cần xác thực)
// Route để lấy tất cả voucher
// Cách dùng: GET http://localhost:3000/api/vouchers
router.get('/', voucherController.listVouchers);

// Kiểm tra mã voucher có hợp lệ hay không
// Cách dùng: POST http://localhost:3000/api/vouchers/validate
// Body: { "ma": "SUMMER20" }
router.post('/validate', voucherController.applyVoucher);
 
// Lấy chi tiết voucher theo id
// Cách dùng: GET http://localhost:3000/api/vouchers/1
router.get('/:id', voucherController.getVoucherDetail);


// ADMIN ROUTES (chỉ Admin được phép)
// Tạo voucher mới
// Cách dùng: POST http://localhost:3000/api/admin/vouchers
// Body: {
//   "ma": "SUMMER20",
//   "giam_gia": 50000,
//   "ngay_het_han": "2026-12-31"
// }
router.post('/admin', voucherController.createVoucher);

// Xóa voucher
// Cách dùng: DELETE http://localhost:3000/api/admin/vouchers/1
router.delete('/admin/:id', voucherController.deleteVoucher);

// Export router để sử dụng trong app.js
module.exports = router;