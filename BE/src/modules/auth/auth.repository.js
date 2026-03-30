const prisma = require("../../config/prisma");

/**
 * Repository xử lý các thao tác database cho người dùng (Authentication)
 * Sử dụng Prisma ORM - KHÔNG sử dụng mysql2
 */
class AuthRepository {
  /**
   * Tìm người dùng theo email
   * @param {string} email - Email người dùng
   * @returns {Promise<Object|null>} Người dùng hoặc null
   */
  async findByEmail(email) {
    return await prisma.nguoi_dung.findUnique({
      where: { email }
    });
  }

  /**
   * Tìm người dùng theo số điện thoại
   * @param {string} soDienThoai - Số điện thoại
   * @returns {Promise<Object|null>} Người dùng hoặc null
   */
  async findBySoDienThoai(soDienThoai) {
    return await prisma.nguoi_dung.findUnique({
      where: { so_dien_thoai: soDienThoai }
    });
  }

  /**
   * Tìm người dùng theo ID
   * @param {number} id - ID người dùng
   * @returns {Promise<Object|null>} Người dùng hoặc null
   */
  async findById(id) {
    return await prisma.nguoi_dung.findUnique({
      where: { id }
    });
  }

  /**
   * Tạo mới người dùng
   * @param {Object} data - Dữ liệu người dùng
   * @returns {Promise<Object>} Người dùng đã tạo
   */
  async create(data) {
    return await prisma.nguoi_dung.create({
      data: {
        email: data.email,
        mat_khau: data.matKhau,
        ten: data.ten,
        so_dien_thoai: data.soDienThoai,
        vai_tro: data.vaiTro || "USER"
      }
    });
  }

  /**
   * Cập nhật thông tin người dùng
   * @param {number} id - ID người dùng
   * @param {Object} data - Dữ liệu cần cập nhật
   * @returns {Promise<Object>} Người dùng đã cập nhật
   */
  async update(id, data) {
    const updateData = {};

    if (data.email) updateData.email = data.email;
    if (data.ten) updateData.ten = data.ten;
    if (data.soDienThoai) updateData.so_dien_thoai = data.soDienThoai;
    if (data.matKhau) updateData.mat_khau = data.matKhau;

    return await prisma.nguoi_dung.update({
      where: { id },
      data: updateData
    });
  }
}

module.exports = new AuthRepository();
