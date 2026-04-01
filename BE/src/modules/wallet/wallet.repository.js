const prisma = require("../../config/prisma");

class WalletRepository {
  // Tìm ví theo loại và chủ sở hữu
  async findByOwner(loai, chuSoHuuId) {
    return await prisma.vi_tien.findFirst({
      where: {
        loai: loai,
        chu_so_huu_id: Number(chuSoHuuId)
      }
    });
  }

  // Tạo ví mới
  async create(data) {
    return await prisma.vi_tien.create({
      data: {
        loai: data.loai,
        chu_so_huu_id: Number(data.chu_so_huu_id),
        so_du: data.so_du || 0
      }
    });
  }

  // Cập nhật số dư
  async updateBalance(id, soDu) {
    return await prisma.vi_tien.update({
      where: { id: Number(id) },
      data: { so_du: soDu }
    });
  }

  // Tăng số dư (nạp tiền)
  async addBalance(id, amount) {
    return await prisma.vi_tien.update({
      where: { id: Number(id) },
      data: {
        so_du: {
          increment: Number(amount)
        }
      }
    });
  }

  // Trừ số dư (rút tiền)
  async subtractBalance(id, amount) {
    return await prisma.vi_tien.update({
      where: { id: Number(id) },
      data: {
        so_du: {
          decrement: Number(amount)
        }
      }
    });
  }

  // Tạo giao dịch
  async createTransaction(data) {
    return await prisma.giao_dich.create({
      data: {
        loai_doi_tuong: data.loai_doi_tuong,
        chu_so_huu_id: Number(data.chu_so_huu_id),
        so_tien: data.so_tien,
        loai: data.loai
      }
    });
  }

  // Lấy lịch sử giao dịch
  async getTransactionHistory(loai, chuSoHuuId) {
    return await prisma.giao_dich.findMany({
      where: {
        loai_doi_tuong: loai,
        chu_so_huu_id: Number(chuSoHuuId)
      },
      orderBy: { ngay_tao: "desc" }
    });
  }

  // Lấy danh sách yêu cầu rút tiền chờ duyệt
  async getPendingWithdrawals() {
    return await prisma.giao_dich.findMany({
      where: {
        loai: "RUT_TIEN",
        trang_thai: "CHO_DUYET"
      },
      orderBy: { ngay_tao: "asc" }
    });
  }

  // Tạo yêu cầu rút tiền
  async createWithdrawalRequest(data) {
    return await prisma.giao_dich.create({
      data: {
        loai_doi_tuong: data.loai_doi_tuong,
        chu_so_huu_id: Number(data.chu_so_huu_id),
        so_tien: data.so_tien,
        loai: "RUT_TIEN",
        trang_thai: "CHO_DUYET"
      }
    });
  }

  // Duyệt yêu cầu rút tiền
  async approveWithdrawal(id) {
    return await prisma.giao_dich.update({
      where: { id: Number(id) },
      data: { trang_thai: "DUYET" }
    });
  }

  // Từ chối yêu cầu rút tiền
  async rejectWithdrawal(id) {
    return await prisma.giao_dich.update({
      where: { id: Number(id) },
      data: { trang_thai: "TU_CHOI" }
    });
  }

  // Tìm giao dịch theo ID
  async findTransactionById(id) {
    return await prisma.giao_dich.findUnique({
      where: { id: Number(id) }
    });
  }
}

module.exports = new WalletRepository();
