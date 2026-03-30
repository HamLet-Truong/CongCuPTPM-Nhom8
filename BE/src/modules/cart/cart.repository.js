const prisma = require("../../config/prisma");

class CartRepository {
  async findByUserId(userId) {
    return await prisma.gio_hang.findMany({
      where: { nguoi_dung_id: Number(userId) },
      include: {
        mon_an: {
          select: {
            id: true,
            ten: true,
            gia: true,
            nha_hang: {
              select: { id: true, ten: true }
            }
          }
        }
      }
    });
  }

  async findByUserAndFood(userId, monAnId) {
    return await prisma.gio_hang.findUnique({
      where: {
        nguoi_dung_id_mon_an_id: {
          nguoi_dung_id: Number(userId),
          mon_an_id: Number(monAnId)
        }
      }
    });
  }

  async findById(id) {
    return await prisma.gio_hang.findUnique({
      where: { id: Number(id) }
    });
  }

  async create(data) {
    return await prisma.gio_hang.create({
      data: {
        nguoi_dung_id: Number(data.nguoi_dung_id),
        mon_an_id: Number(data.mon_an_id),
        so_luong: Number(data.so_luong)
      }
    });
  }

  async updateQuantity(id, soLuong) {
    return await prisma.gio_hang.update({
      where: { id: Number(id) },
      data: { so_luong: Number(soLuong) }
    });
  }

  async delete(id) {
    return await prisma.gio_hang.delete({
      where: { id: Number(id) }
    });
  }
}

module.exports = new CartRepository();
