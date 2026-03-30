const prisma = require("../../config/prisma");

class RestaurantRepository {
  async findMany({ page = 1, limit = 10, status } = {}) {
    const take = Number(limit) > 0 ? Number(limit) : 10;
    const skip = (Number(page) > 1 ? (Number(page) - 1) * take : 0);

    const where = {};
    if (status) {
      where.trang_thai = status;
    }

    const [data, total] = await Promise.all([
      prisma.nha_hang.findMany({ where, skip, take, orderBy: { ngay_tao: 'desc' } }),
      prisma.nha_hang.count({ where })
    ]);

    return { data, total };
  }

  async findById(id) {
    return await prisma.nha_hang.findUnique({ where: { id: Number(id) } });
  }

  async updateStatus(id, status) {
    return await prisma.nha_hang.update({
      where: { id: Number(id) },
      data: { trang_thai: status }
    });
  }
}

module.exports = new RestaurantRepository();
