const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class UserRepository {
  async findById(id) {
    return await prisma.nguoi_dung.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        ten: true,
        so_dien_thoai: true,
        vai_tro: true,
        ngay_tao: true,
        dia_chi: {
          where: { is_active: true },
          select: {
            id: true,
            dia_chi: true,
            mac_dinh: true
          }
        }
      }
    });
  }
}

module.exports = new UserRepository();
