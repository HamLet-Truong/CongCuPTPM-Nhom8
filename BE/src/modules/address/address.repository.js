const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AddressRepository {
  async findAllByUserId(userId) {
    return await prisma.dia_chi.findMany({
      where: {
        nguoi_dung_id: userId,
        is_active: true
      },
      orderBy: { id: 'asc' }
    });
  }

  async findById(addressId) {
    return await prisma.dia_chi.findUnique({
      where: { id: addressId }
    });
  }

  async countByUserId(userId) {
    return await prisma.dia_chi.count({
      where: {
        nguoi_dung_id: userId,
        is_active: true
      }
    });
  }

  async create(userId, data) {
    return await prisma.$transaction(async (tx) => {
      if (data.mac_dinh) {
        await tx.dia_chi.updateMany({
          where: { nguoi_dung_id: userId, mac_dinh: true },
          data: { mac_dinh: false }
        });
      }
      return await tx.dia_chi.create({ data });
    });
  }

  async update(userId, addressId, data) {
    return await prisma.$transaction(async (tx) => {
      if (data.mac_dinh) {
        await tx.dia_chi.updateMany({
          where: { nguoi_dung_id: userId, mac_dinh: true },
          data: { mac_dinh: false }
        });
      }
      return await tx.dia_chi.update({
        where: { id: addressId },
        data
      });
    });
  }

  async softDelete(addressId) {
    return await prisma.dia_chi.update({
      where: { id: addressId },
      data: { is_active: false }
    });
  }
}

module.exports = new AddressRepository();
