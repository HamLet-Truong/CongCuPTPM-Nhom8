const prisma = require("../../config/prisma");

class VoucherRepository {
    // Lấy tất cả voucher
    async findAll() {
        // Dùng Prisma để query bảng Voucher
        const vouchers = await prisma.voucher.findMany({
            select: {
                id: true,
                ma: true,
                giam_gia: true,
                ngay_het_han: true,

        },
        orderBy: {
            ngay_het_han: 'asc' // Sắp xếp theo ngày hết hạn tăng dần
        }
        });
        return vouchers;
    }

    // Tìm voucher theo mã
    async findByCode(ma) {
        const voucher = await prisma.voucher.findUnique({
            where: { 
            ma: ma.toUpperCase()  // Chuyển mã voucher thành chữ hoa để tìm kiếm không phân biệt chữ hoa thường
            }
        });
        return voucher;
    }

    // Tìm voucher theo id
    async findById(id) {
        const voucher = await prisma.voucher.findUnique({
            where: { 
            id: parseInt(id) // Chuyển id từ string sang integer để tìm kiếm
            }
        });
        return voucher;
    }

    // Tạo voucher mới
    async createVoucher(data) {
        const newVoucher = await prisma.voucher.create({
            data: {
                ma: data.ma.toUpperCase(),                  // Chuyển mã voucher thành chữ hoa để lưu trữ
                giam_gia: parseFloat(data.giam_gia),        // Chuyển giam_gia từ string sang float để lưu trữ
                ngay_het_han: new Date(data.ngay_het_han)   // Chuyển ngay_het_han từ string sang Date để lưu trữ
            }
        });
        return newVoucher;
    }

    // Cập nhật voucher
    async updateVoucher(id, data) {
        const updatedVoucher = await prisma.voucher.update({
            where: { id: parseInt(id) },
            data: {
                ma: data.ma ? data.ma.toUpperCase() : undefined, // Nếu có ma mới thì chuyển thành chữ hoa, nếu không thì giữ nguyên
                giam_gia: data.giam_gia ? parseFloat(data.giam_gia) : undefined, // Nếu có giam_gia mới thì chuyển thành float, nếu không thì giữ nguyên
                ngay_het_han: data.ngay_het_han ? new Date(data.ngay_het_han) : undefined // Nếu có ngay_het_han mới thì chuyển thành Date, nếu không thì giữ nguyên
            }
        });
        return updatedVoucher;
    }

    // Xóa voucher
    async deleteVoucher(id) {
        const deletedVoucher = await prisma.voucher.delete({
            where: { id: parseInt(id) }
        });
        return deletedVoucher;
    }

    // Kiểm tra mã voucher có tồn tại hay không
    async codeExists(ma) {
        const voucher = await prisma.voucher.findUnique({
            where: { ma: ma.toUpperCase() }
        });
        return !!voucher; // Trả về true nếu voucher tồn tại, false nếu không
    }
}

// Xuất một instance của VoucherRepository để sử dụng trong các module khác
module.exports = new VoucherRepository();
