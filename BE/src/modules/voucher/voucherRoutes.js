const express = require('express');
const voucherController = require('./voucherController');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Public routes: GET /vouchers
const publicRouter = express.Router();
publicRouter.get('/', voucherController.listVouchers);
publicRouter.post('/validate', voucherController.validateVoucher);
publicRouter.get('/:id', voucherController.getVoucherDetail);

// Admin routes: POST /admin/vouchers (chỉ Admin)
const adminRouter = express.Router();
adminRouter.use(authenticate);
adminRouter.use(authorize('ADMIN'));
adminRouter.post('/', voucherController.createVoucher);
adminRouter.delete('/:id', voucherController.deleteVoucher);

module.exports = { publicRouter, adminRouter };
