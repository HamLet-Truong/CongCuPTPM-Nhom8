const prisma = require("../../config/prisma");

class ShipperRepository {
  async findBySoDienThoai(soDienThoai) {
    return await prisma.shipper.findUnique({
      where: { so_dien_thoai: soDienThoai }
    });
  }

  async create(data) {
    return await prisma.shipper.create({
      data: {
        ten: data.ten,
        so_dien_thoai: data.soDienThoai,
        anh_cccd: data.anhCccd,
        anh_bang_lai: data.anhBangLai,
        anh_ca_vet_xe: data.anhCaVetXe,
        anh_bien_so_xe: data.anhBienSoXe,
        so_tai_khoan: data.soTaiKhoan,
        ten_ngan_hang: data.tenNganHang,
        trang_thai: "CHO_DUYET",
        is_active: true
      }
    });
  }

  async findById(id) {
    return await prisma.shipper.findUnique({
      where: { id }
    });
  }
}

module.exports = new ShipperRepository();
