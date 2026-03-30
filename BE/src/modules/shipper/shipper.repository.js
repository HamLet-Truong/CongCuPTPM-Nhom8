const prisma = require("../../config/prisma");

class ShipperOrderRepository {
  // Đơn hàng đã được nhà hàng xác nhận, chưa gán shipper
  async findAvailableOrders() {
    return await prisma.don_hang.findMany({
      where: {
        trang_thai: "NHA_HANG_XAC_NHAN",
        shipper_id: null
      },
      include: {
        nguoi_dung: { select: { id: true, ten: true, so_dien_thoai: true } },
        nha_hang: { select: { id: true, ten: true, dia_chi: true } },
        dia_chi: { select: { id: true, dia_chi: true } },
        chi_tiet_don_hang: {
          include: { mon_an: { select: { id: true, ten: true, gia: true } } }
        }
      },
      orderBy: { ngay_tao: "desc" }
    });
  }

  // Đơn hàng hiện tại đang giao của shipper
  async findCurrentOrders(shipperId) {
    return await prisma.don_hang.findMany({
      where: {
        shipper_id: Number(shipperId),
        trang_thai: { in: ["DA_GAN_SHIPPER", "DANG_LAY_HANG", "DANG_GIAO"] }
      },
      include: {
        nguoi_dung: { select: { id: true, ten: true, so_dien_thoai: true } },
        nha_hang: { select: { id: true, ten: true, dia_chi: true } },
        dia_chi: { select: { id: true, dia_chi: true } },
        chi_tiet_don_hang: {
          include: { mon_an: { select: { id: true, ten: true, gia: true } } }
        }
      },
      orderBy: { ngay_tao: "desc" }
    });
  }

  // Lịch sử đơn hàng đã hoàn thành / hủy
  async findOrderHistory(shipperId) {
    return await prisma.don_hang.findMany({
      where: {
        shipper_id: Number(shipperId),
        trang_thai: { in: ["HOAN_THANH", "DA_HUY"] }
      },
      include: {
        nguoi_dung: { select: { id: true, ten: true } },
        nha_hang: { select: { id: true, ten: true } },
        dia_chi: { select: { id: true, dia_chi: true } },
        chi_tiet_don_hang: {
          include: { mon_an: { select: { id: true, ten: true, gia: true } } }
        }
      },
      orderBy: { ngay_tao: "desc" }
    });
  }
}

module.exports = new ShipperOrderRepository();
