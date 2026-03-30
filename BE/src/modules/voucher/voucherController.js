const voucherService = require('./voucherService');
const { validateCreateVoucher, validateApplyVoucher } = require('./voucherValidation');

class VoucherController {
    // Lấy danh sách tất cả voucher
    // GET/api/vouchers
    async listVouchers(req, res) {
        try {
            // Gọi service để lấy dữ liệu
            const result = await voucherService.getAllVouchers();

            // Trả về response thành công
            res.json({
                status: 'success',
                data: result.data,
                message: 'Lấy danh sách voucher thành công'
            });
        } catch (error) {
            // Nếu có lỗi trả về error
            res.status(500).json({
                status: 'error',
                message: 'Lỗi khi lấy danh sách voucher'
            });
        }
    }

    // Tạo mới voucher
    // POST/api/admin/vouchers

    async createVoucher(req, res) {
        try {
            // Kiểm tra dữ liệu từ client
            const { error, value } = validateCreateVoucher(req.body);

            // Nếu không hợp lệ trả về lỗi
            if (error) {
                // Lấy danh sách lỗi và gửi về client
                const details = error.datails.map(d => d.message);
                return res.status(400).json({
                    status: 'error',
                    message: 'Dữ liệu không hợp lệ',
                    details
                });
            }

            // Nếu dữ liệu hợp lệ gọi service để tạo voucher
            const result = await voucherService.createVoucher(value);

            // Trả về response thành công
            res.status(201).json({
                status: 'success',
                data: result.data,
                message: 'Tạo voucher thành công'
            });
        } catch (error) {
            // Nếu có lỗi trả về error
            res.status(400).json({
                status: 'error',
                message: 'Lỗi khi tạo voucher'
            });
        }
    }

    // Kiểm tra mã voucher có hợp lệ không
    // POST/api/vouchers/validate

    async validateVoucher(req, res) {
        try {
            // Kiểm tra dữ liệu từ client
            const { error, value } = validateApplyVoucher(req.body);

            // Nếu không hợp lệ trả về lỗi
            if (error) {
                // Lấy danh sách lỗi và gửi về client
                const details = error.datails.map(d => d.message);
                return res.status(400).json({
                    status: 'error',
                    message: 'Dữ liệu không hợp lệ',
                    details
                });
            }

            // Nếu dữ liệu hợp lệ gọi service để kiểm tra voucher
            const result = await voucherService.validateVoucher(value.ma);

            // Trả về response thành công
            res.json({
                status: 'success',
                data: result.data,
                message: 'Mã voucher hợp lệ'
            });
        } catch (error) {
            // Nếu có lỗi trả về error
            res.status(400).json({ 
                status: 'error',
                message: error.message || 'Mã voucher không hợp lệ'
            });
        }
    }

    // Lấy chi tiết voucher theo id
    // GET/api/vouchers/:id

    async getVoucherDetail(req, res) {
        try {
            // Lấy id từ URL
            const { id } = req.params;

            // Gọi service để lấy chi tiết voucher
            const result = await voucherService.getVoucherById(id);

            // Trả về response thành công
            res.json({
                status: 'success',
                data: result.data,
                message: 'Lấy chi tiết voucher thành công'
            });
        } catch (error) {
            // Nếu có lỗi trả về error
            res.status(404).json({
                status: 'error',
                message: 'Voucher không tồn tại'
            });
        }
    }

    // Xóa voucher 
    // DELETE/api/admin/vouchers/:id

    async deleteVoucher(req, res) {
        try {
            // Lấy id từ URL
            const { id } = req.params;

            // Gọi service để xóa voucher
            const result = await voucherService.deleteVoucher(id);

            // Trả về response thành công
            res.json({
                status: 'success',
                data: result.data,
                message: 'Xóa voucher thành công'
            });
        } catch (error) {
            // Nếu có lỗi trả về error
            res.status(404).json({
                status: 'error',
                message: 'Voucher không tồn tại'
            });
        }
    }
}

// Xuất instance để dùng ở routes
module.exports = new VoucherController();