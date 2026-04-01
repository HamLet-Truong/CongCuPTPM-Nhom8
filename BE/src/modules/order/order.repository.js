const prisma = require("../../config/prisma");

class OrderRepository {
  async findById(id) {
    return await prisma.don_hang.findUnique({
      where: { id: Number(id) },
      include: {
        nguoi_dung: {
          select: { id: true, ten: true, email: true, so_dien_thoai: true }
        },
        nha_hang: {
          select: { id: true, ten: true, so_dien_thoai: true, dia_chi: true }
        },
        shipper: {
          select: { id: true, ten: true, so_dien_thoai: true }
        },
        dia_chi: {
          select: { id: true, dia_chi: true, mac_dinh: true }
        },
        voucher: {
          select: { id: true, ma: true, giam_gia: true }
        },
        chi_tiet_don_hang: {
          include: {
            mon_an: {
              select: { id: true, ten: true, gia: true, hinh_anh: true }
            }
          }
        }
      }
    });
  }

  async findByUserId(userId) {
    return await prisma.don_hang.findMany({
      where: { nguoi_dung_id: Number(userId) },
      include: {
        nha_hang: { select: { id: true, ten: true } },
        shipper: { select: { id: true, ten: true } },
        chi_tiet_don_hang: {
          include: {
            mon_an: { select: { id: true, ten: true, gia: true } }
          }
        }
      },
      orderBy: { ngay_tao: "desc" }
    });
  }

  async findByRestaurantId(restaurantId) {
    return await prisma.don_hang.findMany({
      where: { nha_hang_id: Number(restaurantId) },
      include: {
        nguoi_dung: { select: { id: true, ten: true, so_dien_thoai: true } },
        chi_tiet_don_hang: {
          include: { mon_an: { select: { id: true, ten: true } } }
        }
      },
      orderBy: { ngay_tao: "desc" }
    });
  }

  async findPendingByRestaurant(restaurantId) {
    return await prisma.don_hang.findMany({
      where: {
        nha_hang_id: Number(restaurantId),
        trang_thai: "DA_TAO"
      },
      include: {
        nguoi_dung: { select: { id: true, ten: true, so_dien_thoai: true } },
        chi_tiet_don_hang: {
          include: { mon_an: { select: { id: true, ten: true, so_luong: true } } }
        }
      },
      orderBy: { ngay_tao: "asc" }
    });
  }

  async findByShipperId(shipperId) {
    return await prisma.don_hang.findMany({
      where: { shipper_id: Number(shipperId) },
      include: {
        nguoi_dung: { select: { id: true, ten: true, so_dien_thoai: true } },
        nha_hang: { select: { id: true, ten: true, dia_chi: true } },
        chi_tiet_don_hang: {
          include: { mon_an: { select: { id: true, ten: true } } }
        }
      },
      orderBy: { ngay_tao: "desc" }
    });
  }

  async findAvailableForShipper() {
    return await prisma.don_hang.findMany({
      where: {
        trang_thai: "NHA_HANG_XAC_NHAN"
      },
      include: {
        nguoi_dung: { select: { id: true, ten: true, so_dien_thoai: true } },
        nha_hang: { select: { id: true, ten: true, dia_chi: true, so_dien_thoai: true } },
        dia_chi: { select: { id: true, dia_chi: true } },
        chi_tiet_don_hang: {
          include: { mon_an: { select: { id: true, ten: true } } }
        }
      },
      orderBy: { ngay_tao: "asc" }
    });
  }

  async findHistoryByShipper(shipperId) {
    return await prisma.don_hang.findMany({
      where: {
        shipper_id: Number(shipperId),
        trang_thai: { in: ["HOAN_THANH", "DA_HUY"] }
      },
      orderBy: { ngay_tao: "desc" }
    });
  }

  async create(data) {
    return await prisma.don_hang.create({
      data: {
        nguoi_dung_id: Number(data.nguoi_dung_id),
        nha_hang_id: Number(data.nha_hang_id),
        dia_chi_id: Number(data.dia_chi_id),
        voucher_id: data.voucher_id ? Number(data.voucher_id) : null,
        tong_tien: data.tong_tien,
        phuong_thuc_thanh_toan: data.phuong_thuc_thanh_toan,
        trang_thai: "DA_TAO",
        ghi_chu: data.ghi_chu || null,
        chi_tiet_don_hang: {
          create: data.items.map(item => ({
            mon_an_id: Number(item.mon_an_id),
            so_luong: Number(item.so_luong),
            gia: item.gia
          }))
        }
      },
      include: {
        nguoi_dung: { select: { id: true, ten: true } },
        nha_hang: { select: { id: true, ten: true } },
        chi_tiet_don_hang: {
          include: { mon_an: { select: { id: true, ten: true, gia: true } } }
        }
      }
    });
  }

  async updateStatus(id, trang_thai, shipper_id = null) {
    const updateData = { trang_thai };
    if (shipper_id) {
      updateData.shipper_id = Number(shipper_id);
    }
    return await prisma.don_hang.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        nguoi_dung: { select: { id: true, ten: true } },
        nha_hang: { select: { id: true, ten: true } },
        shipper: { select: { id: true, ten: true } }
      }
    });
  }

  async clearCartByUserId(userId) {
    return await prisma.gio_hang.deleteMany({
      where: { nguoi_dung_id: Number(userId) }
    });
  }

  async findCartByUserId(userId) {
    return await prisma.gio_hang.findMany({
      where: { nguoi_dung_id: Number(userId) },
      include: {
        mon_an: {
          select: {
            id: true,
            ten: true,
            gia: true,
            trang_thai: true,
            nha_hang_id: true
          }
        }
      }
    });
  }
}

module.exports = new OrderRepository();
