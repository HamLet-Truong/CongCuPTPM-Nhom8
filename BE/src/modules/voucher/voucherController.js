const voucherService = require('./voucherService');
const { validateCreateVoucher, validateApplyVoucher } = require('./voucherValidation');
const { successResponse, errorResponse } = require('../../utils/response');

class VoucherController {
    // Lấy danh sách tất cả voucher
    // GET/api/vouchers
    async listVouchers(req, res, next) {
        try {
            // Gọi service để lấy dữ liệu
            const result = await voucherService.getAllVouchers();

            // Trả về response thành công
            return successResponse(res, result.data, 200);
        } catch (error) {
            // Nếu có lỗi trả về error
            return next(error);
        }
    }

    // Tạo mới voucher
    // POST/api/admin/vouchers

    async createVoucher(req, res, next) {
        try {
            // Kiểm tra dữ liệu từ client
            const { error, value } = validateCreateVoucher(req.body);

            // Nếu không hợp lệ trả về lỗi
            if (error) {
                // Lấy danh sách lỗi và gửi về client
                const details = error.details.map(d => d.message);
                return errorResponse(res, `Dữ liệu không hợp lệ: ${details.join(', ')}`, 400);
            }

            // Nếu dữ liệu hợp lệ gọi service để tạo voucher
            const result = await voucherService.createVoucher(value);

            // Trả về response thành công
            return successResponse(res, result.data, 201);
        } catch (error) {
            // Nếu có lỗi trả về error
            return next(error);
        }
    }

    // Kiểm tra mã voucher có hợp lệ không
    // POST/api/vouchers/validate

    async validateVoucher(req, res, next) {
        try {
            // Kiểm tra dữ liệu từ client
            const { error, value } = validateApplyVoucher(req.body);

            // Nếu không hợp lệ trả về lỗi
            if (error) {
                // Lấy danh sách lỗi và gửi về client
                const details = error.details.map(d => d.message);
                return errorResponse(res, `Dữ liệu không hợp lệ: ${details.join(', ')}`, 400);
            }

            // Nếu dữ liệu hợp lệ gọi service để kiểm tra voucher
            const result = await voucherService.validateVoucher(value.ma);

            // Trả về response thành công
            return successResponse(res, result.data, 200);
        } catch (error) {
            // Nếu có lỗi trả về error
            return next(error);
        }
    }

    // Lấy chi tiết voucher theo id
    // GET/api/vouchers/:id

    async getVoucherDetail(req, res, next) {
        try {
            // Lấy id từ URL
            const { id } = req.params;

            // Gọi service để lấy chi tiết voucher
            const result = await voucherService.getVoucherDetail(id);

            // Trả về response thành công
            return successResponse(res, result.data, 200);
        } catch (error) {
            // Nếu có lỗi trả về error
            return next(error);
        }
    }

    // Xóa voucher 
    // DELETE/api/admin/vouchers/:id

    async deleteVoucher(req, res, next) {
        try {
            // Lấy id từ URL
            const { id } = req.params;

            // Gọi service để xóa voucher
            const result = await voucherService.deleteVoucher(id);

            // Trả về response thành công
            return successResponse(res, { message: 'Xóa voucher thành công' }, 200);
        } catch (error) {
            // Nếu có lỗi trả về error
            return next(error);
        }
    }
}

// Xuất instance để dùng ở routes
module.exports = new VoucherController();