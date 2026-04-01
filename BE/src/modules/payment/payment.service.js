const Joi = require("joi");
const paymentRepository = require("./payment.repository");
const vnpayConfig = require("./vnpay.config");
const prisma = require("../../config/prisma");

const THANH_TOAN_TRANG_THAI = {
  CHO_THANH_TOAN: "CHO_THANH_TOAN",
  THANH_CONG: "THANH_CONG",
  THAT_BAI: "THAT_BAI"
};

class PaymentService {
  // Schema validation
  createPaymentSchema = Joi.object({
    don_hang_id: Joi.number().integer().positive().required().messages({
      "any.required": "don_hang_id là bắt buộc"
    })
  });

  // Lấy IP từ request
  getClientIp(req) {
    return (
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "127.0.0.1"
    );
  }

  // Tạo URL thanh toán VNPAY
  async createVnpayUrl(userId, donHangId, req) {
    // Validate
    const { error, value } = this.createPaymentSchema.validate({ don_hang_id: donHangId }, { abortEarly: false });
    if (error) {
      const err = new Error(error.details.map(d => d.message).join(", "));
      err.status = 400;
      throw err;
    }

    return await prisma.$transaction(async (tx) => {
      // Kiểm tra đơn hàng tồn tại và thuộc về user
      const order = await tx.don_hang.findUnique({
        where: { id: Number(donHangId) },
        include: {
          nguoi_dung: { select: { id: true, ten: true } }
        }
      });

      if (!order) {
        const err = new Error("Không tìm thấy đơn hàng");
        err.status = 404;
        throw err;
      }

      if (order.nguoi_dung_id !== Number(userId)) {
        const err = new Error("Bạn không có quyền thanh toán đơn hàng này");
        err.status = 403;
        throw err;
      }

      // Kiểm tra phương thức thanh toán
      if (order.phuong_thuc_thanh_toan !== "VNPAY") {
        const err = new Error("Đơn hàng không hỗ trợ thanh toán VNPAY");
        err.status = 400;
        throw err;
      }

      // Kiểm tra đơn hàng chưa thanh toán
      const existingPayment = await tx.thanh_toan.findFirst({
        where: { don_hang_id: Number(donHangId) }
      });

      if (existingPayment && existingPayment.trang_thai === "THANH_CONG") {
        const err = new Error("Đơn hàng đã được thanh toán");
        err.status = 400;
        throw err;
      }

      // Tạo hoặc cập nhật thanh toán
      const soTien = Number(order.tong_tien);
      const orderInfo = `Thanh toan don hang #${donHangId} - ${order.nguoi_dung.ten}`;
      const ipAddr = this.getClientIp(req);

      // Tạo URL thanh toán
      const { paymentUrl, params, signature } = vnpayConfig.createPaymentUrl(
        donHangId,
        soTien,
        orderInfo,
        ipAddr
      );

      // Lưu thông tin thanh toán
      if (existingPayment) {
        await tx.thanh_toan.update({
          where: { id: existingPayment.id },
          data: {
            so_tien: soTien,
            trang_thai: "CHO_THANH_TOAN",
            ma_giao_dich: `VNPAY_${donHangId}_${Date.now()}`
          }
        });
      } else {
        await tx.thanh_toan.create({
          data: {
            don_hang_id: Number(donHangId),
            so_tien: soTien,
            trang_thai: "CHO_THANH_TOAN",
            ma_giao_dich: `VNPAY_${donHangId}_${Date.now()}`,
            phuong_thuc: "VNPAY"
          }
        });
      }

      return {
        paymentUrl,
        vnp_Params: params,
        vnp_SecureHash: signature,
        orderId: donHangId,
        amount: soTien
      };
    });
  }

  // Xử lý kết quả thanh toán từ VNPAY (Return URL)
  async handleVnpayReturn(queryParams) {
    // Verify checksum
    const verifyResult = vnpayConfig.verifyReturnUrl(queryParams);

    if (!verifyResult.isValid) {
      return {
        success: false,
        message: "Checksum không hợp lệ",
        orderId: queryParams.vnp_TxnRef,
        data: verifyResult
      };
    }

    const {
      vnp_ResponseId,
      vnp_ResponseCode,
      vnp_TransactionStatus,
      vnp_TxnRef,
      vnp_Amount,
      vnp_OrderInfo,
      vnp_BankCode,
      vnp_PayDate,
      vnp_TransactionNo
    } = queryParams;

    return await prisma.$transaction(async (tx) => {
      // Tìm thanh toán
      let payment = await tx.thanh_toan.findFirst({
        where: { don_hang_id: Number(vnp_TxnRef) }
      });

      if (!payment) {
        return {
          success: false,
          message: "Không tìm thấy thông tin thanh toán",
          orderId: vnp_TxnRef
        };
      }

      // Kiểm tra trạng thái giao dịch từ VNPAY
      // vnp_TransactionStatus: 00 = thành công
      if (vnp_TransactionStatus === "00") {
        // Cập nhật thanh toán thành công
        await tx.thanh_toan.update({
          where: { id: payment.id },
          data: {
            trang_thai: "THANH_CONG",
            ma_giao_dich: vnp_TransactionNo || payment.ma_giao_dich
          }
        });

        // Cập nhật trạng thái đơn hàng (chuyển sang nhà hàng xác nhận)
        await tx.don_hang.update({
          where: { id: Number(vnp_TxnRef) },
          data: {
            trang_thai: "NHA_HANG_XAC_NHAN"
          }
        });

        return {
          success: true,
          message: "Thanh toán thành công",
          orderId: vnp_TxnRef,
          amount: Number(vnp_Amount) / 100,
          transactionNo: vnp_TransactionNo,
          bankCode: vnp_BankCode,
          payDate: vnp_PayDate,
          responseCode: vnp_ResponseCode
        };
      } else {
        // Thanh toán thất bại
        await tx.thanh_toan.update({
          where: { id: payment.id },
          data: {
            trang_thai: "THAT_BAI",
            ma_giao_dich: vnp_TransactionNo || payment.ma_giao_dich
          }
        });

        // Giữ nguyên trạng thái đơn hàng
        return {
          success: false,
          message: getVnpayMessage(vnp_TransactionStatus),
          orderId: vnp_TxnRef,
          amount: Number(vnp_Amount) / 100,
          transactionNo: vnp_TransactionNo,
          responseCode: vnp_ResponseCode
        };
      }
    });
  }

  // Lấy thông tin thanh toán của đơn hàng
  async getPaymentByOrderId(orderId) {
    const payment = await paymentRepository.findByOrderId(orderId);

    if (!payment) {
      const err = new Error("Không tìm thấy thông tin thanh toán");
      err.status = 404;
      throw err;
    }

    return payment;
  }
}

// Helper function lấy message từ VNPAY response code
function getVnpayMessage(code) {
  const messages = {
    "00": "Giao dịch thành công",
    "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, trùng lặp...)",
    "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking",
    "10": "Giao dịch không thành công do: Khách hàng xác thực sai mật khẩu OTP",
    "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán",
    "12": "Giao dịch không thành công do: Thẻ/Tài khoản bị khóa",
    "13": "Giao dịch không thành công do: Nhập sai mật khẩu OTP",
    "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
    "51": "Giao dịch không thành công do: Tài khoản không đủ số dư",
    "65": "Giao dịch không thành công do: Tài khoản đã vượt quá hạn mức giao dịch trong ngày",
    "81": "Giao dịch không thành công do: Sai mã PIN",
    "99": "Các lỗi khác"
  };

  return messages[code] || `Lỗi không xác định (mã: ${code})`;
}

module.exports = new PaymentService();
