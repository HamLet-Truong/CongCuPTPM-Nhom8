const prisma = require("../../config/prisma");

class ShipperRepository {
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

  // ===== ADMIN FUNCTIONS =====
  // Lấy danh sách shipper chờ duyệt
  async findPendingShippers() {
    return await prisma.shipper.findMany({
      where: {
        trang_thai: "CHO_DUYET"
      },
      select: {
        id: true,
        ten: true,
        so_dien_thoai: true,
        anh_cccd: true,
        anh_bang_lai: true,
        anh_ca_vet_xe: true,
        anh_bien_so_xe: true,
        trang_thai: true,
        ngay_tao: true
      },
      orderBy: { ngay_tao: "asc" }
    });
  }

  // Lấy danh sách tất cả shipper
  async findAllShippers() {
    return await prisma.shipper.findMany({
      select: {
        id: true,
        ten: true,
        so_dien_thoai: true,
        trang_thai: true,
        is_active: true,
        ngay_tao: true
      },
      orderBy: { ngay_tao: "desc" }
    });
  }

  // Lấy chi tiết shipper
  async findShipperById(id) {
    return await prisma.shipper.findUnique({
      where: { id: Number(id) },
      include: {
        tai_khoan: {
          select: {
            id: true,
            email: true,
            ten: true,
            so_dien_thoai: true
          }
        }
      }
    });
  }

  // Admin duyệt shipper
  async approveShipper(id) {
    return await prisma.shipper.update({
      where: { id: Number(id) },
      data: {
        trang_thai: "HOAT_DONG",
        is_active: true
      },
      select: {
        id: true,
        ten: true,
        so_dien_thoai: true,
        trang_thai: true
      }
    });
  }

  // Admin từ chối shipper
  async rejectShipper(id) {
    return await prisma.shipper.update({
      where: { id: Number(id) },
      data: {
        trang_thai: "BI_KHOA"
      },
      select: {
        id: true,
        ten: true,
        trang_thai: true
      }
    });
  }

  // Admin khóa shipper
  async lockShipper(id) {
    return await prisma.shipper.update({
      where: { id: Number(id) },
      data: {
        trang_thai: "BI_KHOA",
        is_active: false
      },
      select: {
        id: true,
        ten: true,
        trang_thai: true,
        is_active: true
      }
    });
  }
}

module.exports = new ShipperRepository();
