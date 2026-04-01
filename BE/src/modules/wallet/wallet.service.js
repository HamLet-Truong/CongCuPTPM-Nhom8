const Joi = require("joi");
const walletRepository = require("./wallet.repository");
const prisma = require("../../config/prisma");

const LOAI_TAI_KHOAN = {
  USER: "USER",
  SHIPPER: "SHIPPER",
  NHA_HANG: "NHA_HANG"
};

const GIAO_DICH_LOAI = {
  NAP_TIEN: "NAP_TIEN",
  RUT_TIEN: "RUT_TIEN",
  THANH_TOAN: "THANH_TOAN"
};

const TRANG_THAI_GIAO_DICH = {
  CHO_DUYET: "CHO_DUYET",
  DA_DUYET: "DA_DUYET",
  TU_CHOI: "TU_CHOI"
};

const MIN_WITHDRAW = 10000; // Tối thiểu 10,000 VND để rút
const MIN_DEPOSIT = 1000;    // Tối thiểu 1,000 VND để nạp

class WalletService {
  // Schema validation
  depositSchema = Joi.object({
    so_tien: Joi.number().positive().min(MIN_DEPOSIT).required().messages({
      "number.min": `Số tiền nạp tối thiểu là ${MIN_DEPOSIT}đ`,
      "any.required": "Số tiền là bắt buộc"
    })
  });

  withdrawSchema = Joi.object({
    so_tien: Joi.number().positive().min(MIN_WITHDRAW).required().messages({
      "number.min": `Số tiền rút tối thiểu là ${MIN_WITHDRAW}đ`,
      "any.required": "Số tiền là bắt buộc"
    })
  });

  // Lấy loại ví từ vai trò user
  getLoaiVi(vaiTro) {
    const mapping = {
      "USER": LOAI_TAI_KHOAN.USER,
      "SHIPPER": LOAI_TAI_KHOAN.SHIPPER,
      "NHA_HANG": LOAI_TAI_KHOAN.NHA_HANG
    };
    return mapping[vaiTro] || LOAI_TAI_KHOAN.USER;
  }

  // Lấy hoặc tạo ví cho user
  async getOrCreateWallet(loai, chuSoHuuId) {
    let wallet = await walletRepository.findByOwner(loai, chuSoHuuId);
    
    if (!wallet) {
      wallet = await walletRepository.create({
        loai: loai,
        chu_so_huu_id: chuSoHuuId,
        so_du: 0
      });
    }
    
    return wallet;
  }

  // Lấy thông tin ví và số dư
  async getWallet(vaiTro, userId) {
    const loai = this.getLoaiVi(vaiTro);
    const wallet = await this.getOrCreateWallet(loai, userId);

    // Lấy lịch sử giao dịch gần đây
    const transactions = await walletRepository.getTransactionHistory(loai, userId);

    return {
      id: wallet.id,
      loai: wallet.loai,
      chu_so_huu_id: wallet.chu_so_huu_id,
      so_du: Number(wallet.so_du),
      lich_su_giao_dich: transactions.slice(0, 10).map(t => ({
        id: t.id,
        loai: t.loai,
        so_tien: Number(t.so_tien),
        ngay_tao: t.ngay_tao
      }))
    };
  }

  // Nạp tiền (tạo transaction, auto approve)
  async deposit(vaiTro, userId, soTien) {
    // Validate
    const { error, value } = this.depositSchema.validate({ so_tien: soTien }, { abortEarly: false });
    if (error) {
      const err = new Error(error.details.map(d => d.message).join(", "));
      err.status = 400;
      throw err;
    }

    return await prisma.$transaction(async (tx) => {
      const loai = this.getLoaiVi(vaiTro);

      // Lấy hoặc tạo ví
      let wallet = await tx.vi_tien.findFirst({
        where: { loai: loai, chu_so_huu_id: Number(userId) }
      });

      if (!wallet) {
        wallet = await tx.vi_tien.create({
          data: {
            loai: loai,
            chu_so_huu_id: Number(userId),
            so_du: 0
          }
        });
      }

      // Cập nhật số dư
      const updatedWallet = await tx.vi_tien.update({
        where: { id: wallet.id },
        data: {
          so_du: {
            increment: Number(value.so_tien)
          }
        }
      });

      // Tạo giao dịch nạp tiền (auto approved)
      const transaction = await tx.giao_dich.create({
        data: {
          loai_doi_tuong: loai,
          chu_so_huu_id: Number(userId),
          so_tien: Number(value.so_tien),
          loai: GIAO_DICH_LOAI.NAP_TIEN
        }
      });

      return {
        wallet: {
          id: updatedWallet.id,
          so_du: Number(updatedWallet.so_du)
        },
        transaction: {
          id: transaction.id,
          loai: transaction.loai,
          so_tien: Number(transaction.so_tien),
          trang_thai: "DA_DUYET"
        },
        message: `Nạp tiền thành công ${Number(value.so_tien).toLocaleString()}đ`
      };
    });
  }

  // Rút tiền (cần admin duyệt)
  async withdraw(vaiTro, userId, soTien) {
    // Validate
    const { error, value } = this.withdrawSchema.validate({ so_tien: soTien }, { abortEarly: false });
    if (error) {
      const err = new Error(error.details.map(d => d.message).join(", "));
      err.status = 400;
      throw err;
    }

    return await prisma.$transaction(async (tx) => {
      const loai = this.getLoaiVi(vaiTro);

      // Kiểm tra ví tồn tại
      const wallet = await tx.vi_tien.findFirst({
        where: { loai: loai, chu_so_huu_id: Number(userId) }
      });

      if (!wallet) {
        const err = new Error("Ví không tồn tại. Vui lòng nạp tiền trước.");
        err.status = 400;
        throw err;
      }

      // Kiểm tra số dư
      if (Number(wallet.so_du) < Number(value.so_tien)) {
        const err = new Error(`Số dư không đủ. Số dư hiện tại: ${Number(wallet.so_du).toLocaleString()}đ`);
        err.status = 400;
        throw err;
      }

      // Trừ số dư tạm thời (sẽ hoàn lại nếu admin từ chối)
      const updatedWallet = await tx.vi_tien.update({
        where: { id: wallet.id },
        data: {
          so_du: {
            decrement: Number(value.so_tien)
          }
        }
      });

      // Tạo yêu cầu rút tiền (chờ duyệt)
      const transaction = await tx.giao_dich.create({
        data: {
          loai_doi_tuong: loai,
          chu_so_huu_id: Number(userId),
          so_tien: Number(value.so_tien),
          loai: GIAO_DICH_LOAI.RUT_TIEN
        }
      });

      return {
        wallet: {
          id: updatedWallet.id,
          so_du: Number(updatedWallet.so_du)
        },
        transaction: {
          id: transaction.id,
          loai: transaction.loai,
          so_tien: Number(transaction.so_tien),
          trang_thai: "CHO_DUYET"
        },
        message: `Yêu cầu rút tiền ${Number(value.so_tien).toLocaleString()}đ đang chờ duyệt`
      };
    });
  }

  // ADMIN: Lấy danh sách yêu cầu rút tiền
  async getPendingWithdrawals() {
    const withdrawals = await walletRepository.getPendingWithdrawals();

    // Lấy thông tin chủ sở hữu
    const results = await Promise.all(
      withdrawals.map(async (w) => {
        let ownerInfo = null;
        
        if (w.loai_doi_tuong === "USER") {
          const user = await prisma.nguoi_dung.findUnique({
            where: { id: w.chu_so_huu_id },
            select: { id: true, ten: true, email: true, so_dien_thoai: true }
          });
          ownerInfo = { ...user, vai_tro: "USER" };
        } else if (w.loai_doi_tuong === "SHIPPER") {
          const shipper = await prisma.shipper.findUnique({
            where: { tai_khoan_id: w.chu_so_huu_id },
            include: { tai_khoan: { select: { id: true, ten: true, email: true } } }
          });
          ownerInfo = { 
            id: shipper?.id, 
            ten: shipper?.tai_khoan?.ten, 
            email: shipper?.tai_khoan?.email,
            so_dien_thoai: shipper?.so_dien_thoai,
            so_tai_khoan: shipper?.so_tai_khoan,
            ten_ngan_hang: shipper?.ten_ngan_hang,
            vai_tro: "SHIPPER" 
          };
        }

        return {
          id: w.id,
          loai_tai_khoan: w.loai_doi_tuong,
          chu_so_huu_id: w.chu_so_huu_id,
          so_tien: Number(w.so_tien),
          ngay_tao: w.ngay_tao,
          chu_so_huu: ownerInfo
        };
      })
    );

    return results;
  }

  // ADMIN: Duyệt yêu cầu rút tiền
  async approveWithdrawal(transactionId, adminId) {
    const transaction = await walletRepository.findTransactionById(transactionId);

    if (!transaction) {
      const err = new Error("Không tìm thấy giao dịch");
      err.status = 404;
      throw err;
    }

    if (transaction.loai !== "RUT_TIEN") {
      const err = new Error("Giao dịch không phải yêu cầu rút tiền");
      err.status = 400;
      throw err;
    }

    if (transaction.loai_doi_tuong !== "CHO_DUYET") {
      const err = new Error("Giao dịch đã được xử lý");
      err.status = 400;
      throw err;
    }

    // Cập nhật trạng thái giao dịch
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.giao_dich.update({
        where: { id: Number(transactionId) },
        data: { loai_doi_tuong: "DA_DUYET" }
      });

      return {
        id: updated.id,
        so_tien: Number(updated.so_tien),
        trang_thai: "DA_DUYET",
        message: "Duyệt rút tiền thành công"
      };
    });
  }

  // ADMIN: Từ chối yêu cầu rút tiền (hoàn tiền lại ví)
  async rejectWithdrawal(transactionId, adminId, lyDo = null) {
    const transaction = await walletRepository.findTransactionById(transactionId);

    if (!transaction) {
      const err = new Error("Không tìm thấy giao dịch");
      err.status = 404;
      throw err;
    }

    if (transaction.loai !== "RUT_TIEN") {
      const err = new Error("Giao dịch không phải yêu cầu rút tiền");
      err.status = 400;
      throw err;
    }

    if (transaction.loai_doi_tuong !== "CHO_DUYET") {
      const err = new Error("Giao dịch đã được xử lý");
      err.status = 400;
      throw err;
    }

    // Hoàn tiền lại ví và cập nhật trạng thái
    return await prisma.$transaction(async (tx) => {
      // Cập nhật trạng thái giao dịch
      await tx.giao_dich.update({
        where: { id: Number(transactionId) },
        data: { loai_doi_tuong: "TU_CHOI" }
      });

      // Hoàn tiền lại ví
      await tx.vi_tien.update({
        where: { 
          loai_chu_so_huu_id: {
            loai: transaction.loai_doi_tuong,
            chu_so_huu_id: transaction.chu_so_huu_id
          }
        },
        data: {
          so_du: {
            increment: Number(transaction.so_tien)
          }
        }
      });

      return {
        id: transaction.id,
        so_tien: Number(transaction.so_tien),
        trang_thai: "TU_CHOI",
        message: "Đã từ chối và hoàn tiền"
      };
    });
  }
}

module.exports = new WalletService();
