const prisma = require("../../config/prisma");

class NhaHangRepository {
  async findBySoDienThoai(soDienThoai) {
    return await prisma.nha_hang.findUnique({
      where: { so_dien_thoai: soDienThoai }
    });
  }

  async create(data) {
    return await prisma.nha_hang.create({
      data: {
        ten: data.ten,
        so_dien_thoai: data.soDienThoai,
        dia_chi: data.diaChi,
        anh_quan: data.anhQuan,
        giay_phep_kinh_doanh: data.giayPhepKinhDoanh,
        anh_cccd: data.anhCccd,
        anh_vstp: data.anhVstp,
        so_tai_khoan: data.soTaiKhoan,
        ten_ngan_hang: data.tenNganHang,
        trang_thai: "CHO_DUYET",
        is_active: true
      }
    });
  }

  async findById(id) {
    return await prisma.nha_hang.findUnique({
      where: { id }
    });
  }

  async findByEmail(email) {
    return await prisma.nha_hang.findFirst({
      where: { dia_chi: { contains: email } }
    });
  }
}

module.exports = new NhaHangRepository();
