const express = require('express');
const router = express.Router();
const voucherController = require('./voucherController');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');


router.get('/', voucherController.listVouchers);


router.post('/validate', voucherController.validateVoucher);
 

router.get('/:id', voucherController.getVoucherDetail);


router.post('/admin', authenticate, authorize('ADMIN'), voucherController.createVoucher);


router.delete('/admin/:id', authenticate, authorize('ADMIN'), voucherController.deleteVoucher);

module.exports = router;