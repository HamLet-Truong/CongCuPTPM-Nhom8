const walletService = require("./wallet.service");

class WalletController {
  // USER/SHIPPER: Lấy thông tin ví
  async getWallet(req, res, next) {
    try {
      const { vai_tro, id } = req.user;
      const wallet = await walletService.getWallet(vai_tro, id);
      res.status(200).json({
        success: true,
        data: wallet
      });
    } catch (error) {
      next(error);
    }
  }

  // USER/SHIPPER: Nạp tiền
  async deposit(req, res, next) {
    try {
      const { vai_tro, id } = req.user;
      const { so_tien } = req.body;
      const result = await walletService.deposit(vai_tro, id, so_tien);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // USER/SHIPPER: Rút tiền
  async withdraw(req, res, next) {
    try {
      const { vai_tro, id } = req.user;
      const { so_tien } = req.body;
      const result = await walletService.withdraw(vai_tro, id, so_tien);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // ADMIN: Lấy danh sách rút tiền chờ duyệt
  async getPendingWithdrawals(req, res, next) {
    try {
      const withdrawals = await walletService.getPendingWithdrawals();
      res.status(200).json({
        success: true,
        data: withdrawals
      });
    } catch (error) {
      next(error);
    }
  }

  // ADMIN: Duyệt rút tiền
  async approveWithdrawal(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      const result = await walletService.approveWithdrawal(id, adminId);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // ADMIN: Từ chối rút tiền
  async rejectWithdrawal(req, res, next) {
    try {
      const { id } = req.params;
      const { ly_do } = req.body;
      const adminId = req.user.id;
      const result = await walletService.rejectWithdrawal(id, adminId, ly_do);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WalletController();
