const prisma = require("../../config/prisma");

class PaymentRepository {
  // Tạo thanh toán
  async createPayment(data) {
    return await prisma.thanh_toan.create({
      data: {
        don_hang_id: Number(data.don_hang_id),
        so_tien: data.so_tien,
        trang_thai: "CHO_THANH_TOAN",
        ma_giao_dich: data.ma_giao_dich || null,
        phuong_thuc: "VNPAY"
      }
    });
  }

  // Tìm thanh toán theo đơn hàng
  async findByOrderId(orderId) {
    return await prisma.thanh_toan.findFirst({
      where: { don_hang_id: Number(orderId) }
    });
  }

  // Cập nhật trạng thái thanh toán
  async updateStatus(id, trang_thai, maGiaoDich = null) {
    const data = { trang_thai };
    if (maGiaoDich) {
      data.ma_giao_dich = maGiaoDich;
    }
    return await prisma.thanh_toan.update({
      where: { id: Number(id) },
      data
    });
  }

  // Tìm thanh toán theo ID
  async findById(id) {
    return await prisma.thanh_toan.findUnique({
      where: { id: Number(id) },
      include: {
        don_hang: {
          include: {
            nguoi_dung: { select: { id: true, ten: true, email: true } },
            nha_hang: { select: { id: true, ten: true } }
          }
        }
      }
    });
  }
}

module.exports = new PaymentRepository();
