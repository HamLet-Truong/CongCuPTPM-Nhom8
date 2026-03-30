const prisma = require("../../config/prisma");

class FoodRepository {
  async findAll(nhaHangId) {
    const where = nhaHangId ? { nha_hang_id: Number(nhaHangId) } : {};
    return await prisma.mon_an.findMany({
      where,
      include: {
        nha_hang: {
          select: {
            id: true,
            ten: true
          }
        }
      }
    });
  }

  async findById(id) {
    return await prisma.mon_an.findUnique({
      where: { id: Number(id) }
    });
  }

  async create(data) {
    return await prisma.mon_an.create({
      data: {
        ten: data.ten,
        gia: data.gia,
        nha_hang: {
          connect: { id: Number(data.nha_hang_id) }
        }
      }
    });
  }

  async update(id, data) {
    return await prisma.mon_an.update({
      where: { id: Number(id) },
      data: {
        ten: data.ten,
        gia: data.gia
      }
    });
  }

  async delete(id) {
    return await prisma.mon_an.delete({
      where: { id: Number(id) }
    });
  }
}

module.exports = new FoodRepository();
