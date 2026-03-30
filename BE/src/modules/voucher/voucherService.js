const voucherRepository = require('./voucherRepository');


// ===== SERVICE - LOGIC CHÍNH CỦA VOUCHER =====
// Xử lý các business logic, kiểm tra, validate dữ liệu

class VoucherService {
    // Lấy tất cả voucher
    async gitAllVouchers() {
        try {
            // Gọi repository để lấy dữ liệu
            const vouchers = await voucherRepository.findAll();
            
            // Trả về kết quả
            return {
                success: true,
                data: vouchers
            };
        } catch (error) {
            // Nếu có lỗi, trả về lỗi
            throw new Error('Lỗi khi lấy danh sách voucher:  ${error.message}');
        }
    }

    // Tạo voucher mới( Admin mới được phép)
    async createVoucher(data) {
        try {
            // Kiểm tra dữ liệu đầu vào (validate)
            const exists = await voucherRepository.codeExists(data.ma);
            if (exists) {
                throw new Error('Mã voucher đã tồn tại');
            }

            // Kiểm tra ngày hết hạn phải lớn hơn ngày hiện tại
            const expirryDate = new Date(data.ngay_het_han);
            const now = new Date();
            if (expirryDate <= now) {
                throw new Error('Ngày hết hạn phải lớn hơn ngày hiện tại');
            }

            // Gọi repository để tạo voucher mới
            const newVoucher = await voucherRepository.create(data);

            // Trả về kết quả
            return {
                success: true,
                message: 'Tạo voucher thành công',
                data: newVoucher
            };
        } catch (error) {
            // Nếu có lỗi, trả về lỗi
            throw new Error(`Lỗi khi tạo voucher: ${error.message}`);

        }
    }

    // Kiểm tra mã voucher có hợp lệ hay không (khi khách hàng áp dụng voucher)
    async validateVoucher(ma) {
        try {
            // Gọi repository để tìm voucher theo mã
            const voucher = await voucherRepository.findByCode(ma);

            //Kiểm tra nếu voucher có tồn tại không
            if (!voucher) {
                throw new Error('Mã voucher không tồn tại');
            }

            // Kiểm tra nếu voucher đã hết hạn
            const expiryDate = new Date(voucher.ngay_het_han);
            const now = new Date();
            if (expiryDate <= now) {
                throw new Error('Voucher đã hết hạn');
            }

            // Nếu voucher hợp lệ, trả về thông tin voucher
            return {
                success: true,
                data: voucher
            };
        } catch (error) {
            // Nếu có lỗi, trả về lỗi
            throw new Error(`Lỗi khi kiểm tra voucher: ${error.message}`);
        }
    }

    // Lấy chi tiết voucher theo id
    async getVoucherDetail(id) {
        try {
            // Gọi repository để tìm voucher theo id
            const voucher = await voucherRepository.findById(id);

            // Kiểm tra nếu voucher có tồn tại không
            if (!voucher) {
                throw new Error('Voucher không tồn tại');
            }

            // Nếu voucher tồn tại, trả về thông tin voucher
            return {
                success: true,
                data: voucher
            };
        } catch (error) {
            // Nếu có lỗi, trả về lỗi
            throw new Error(`Lỗi khi lấy chi tiết voucher: ${error.message}`);
        }
    }

    // Xóa voucher (Admin mới được phép)
    async deleteVoucher(id) {
        try {
            // Gọi repository để xóa voucher
            const voucher = await voucherRepository.findById(id);
            if (!voucher) {
                throw new Error('Voucher không tồn tại');
            }  
            // Nếu voucher tồn tại, tiến hành xóa
            await voucherRepository.delete(id);

            // Trả về kết quả
            return {
                success: true,
                message: 'Xóa voucher thành công'
            };
        } catch (error) {
            // Nếu có lỗi, trả về lỗi
            throw new Error(`Lỗi khi xóa voucher: ${error.message}`);
        }
    }
}

// Xuất instance của VoucherService để sử dụng trong controller
module.exports = new VoucherService();