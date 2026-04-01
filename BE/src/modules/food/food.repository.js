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
        mo_ta: data.mo_ta || null,
        gia: data.gia,
        hinh_anh: data.hinh_anh || null,
        trang_thai: data.trang_thai || "CON_HANG",
        nha_hang: {
          connect: { id: Number(data.nha_hang_id) }
        }
      }
    });
  }

  async update(id, data) {
    const updateData = {};

    if (data.ten !== undefined) updateData.ten = data.ten;
    if (data.mo_ta !== undefined) updateData.mo_ta = data.mo_ta;
    if (data.gia !== undefined) updateData.gia = data.gia;
    if (data.hinh_anh !== undefined) updateData.hinh_anh = data.hinh_anh;
    if (data.trang_thai !== undefined) updateData.trang_thai = data.trang_thai;

    return await prisma.mon_an.update({
      where: { id: Number(id) },
      data: updateData
    });
  }

  async delete(id) {
    return await prisma.mon_an.delete({
      where: { id: Number(id) }
    });
  }
}

module.exports = new FoodRepository();
