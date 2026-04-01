const Joi = require("joi");
const orderRepository = require("./order.repository");
const prisma = require("../../config/prisma");

const ORDER_STATUS = {
  DA_TAO: "DA_TAO",
  NHA_HANG_XAC_NHAN: "NHA_HANG_XAC_NHAN",
  DA_GAN_SHIPPER: "DA_GAN_SHIPPER",
  DANG_LAY_HANG: "DANG_LAY_HANG",
  DANG_GIAO: "DANG_GIAO",
  HOAN_THANH: "HOAN_THANH",
  DA_HUY: "DA_HUY"
};

const CAN_CANCEL_STATUS = [ORDER_STATUS.DA_TAO, ORDER_STATUS.NHA_HANG_XAC_NHAN];

class OrderService {
  // Validation schemas
  createOrderSchema = Joi.object({
    nha_hang_id: Joi.number().integer().positive().required().messages({
      "any.required": "nha_hang_id là bắt buộc"
    }),
    dia_chi_id: Joi.number().integer().positive().required().messages({
      "any.required": "dia_chi_id là bắt buộc"
    }),
    voucher_id: Joi.number().integer().positive().optional().allow(null),
    phuong_thuc_thanh_toan: Joi.string().valid("TIEN_MAT", "VNPAY").required().messages({
      "any.only": "phuong_thuc_thanh_toan phải là TIEN_MAT hoặc VNPAY",
      "any.required": "phuong_thuc_thanh_toan là bắt buộc"
    }),
    ghi_chu: Joi.string().max(500).optional().allow(null, ""),
    items: Joi.array().items(
      Joi.object({
        mon_an_id: Joi.number().integer().positive().required(),
        so_luong: Joi.number().integer().positive().min(1).required()
      })
    ).optional()
  });

  cancelSchema = Joi.object({});

  // State machine - kiểm tra transition hợp lệ
  isValidTransition(currentStatus, newStatus) {
    const transitions = {
      [ORDER_STATUS.DA_TAO]: [ORDER_STATUS.NHA_HANG_XAC_NHAN, ORDER_STATUS.DA_HUY],
      [ORDER_STATUS.NHA_HANG_XAC_NHAN]: [ORDER_STATUS.DA_GAN_SHIPPER, ORDER_STATUS.DA_HUY],
      [ORDER_STATUS.DA_GAN_SHIPPER]: [ORDER_STATUS.DANG_LAY_HANG],
      [ORDER_STATUS.DANG_LAY_HANG]: [ORDER_STATUS.DANG_GIAO],
      [ORDER_STATUS.DANG_GIAO]: [ORDER_STATUS.HOAN_THANH],
      [ORDER_STATUS.HOAN_THANH]: [],
      [ORDER_STATUS.DA_HUY]: []
    };

    return transitions[currentStatus]?.includes(newStatus) || false;
  }

  // Lấy danh sách đơn hàng của user
  async getOrdersByUser(userId) {
    return await orderRepository.findByUserId(userId);
  }

  // Lấy chi tiết đơn hàng
  async getOrderById(id, userId = null, userRole = null) {
    const order = await orderRepository.findById(id);

    if (!order) {
      const error = new Error("Không tìm thấy đơn hàng");
      error.status = 404;
      throw error;
    }

    // Kiểm tra quyền truy cập
    if (userId && userRole !== "ADMIN") {
      if (order.nguoi_dung_id !== Number(userId)) {
        const error = new Error("Bạn không có quyền xem đơn hàng này");
        error.status = 403;
        throw error;
      }
    }

    return order;
  }

  // Tạo đơn hàng (từ cart hoặc items trực tiếp)
  async createOrder(userId, data) {
    // Validate input
    const { error, value } = this.createOrderSchema.validate(data, { abortEarly: false });
    if (error) {
      const validationError = new Error(error.details.map(d => d.message).join(", "));
      validationError.status = 400;
      throw validationError;
    }

    // Transaction để đảm bảo tính toàn vẹn dữ liệu
    return await prisma.$transaction(async (tx) => {
      // 1. Kiểm tra nhà hàng tồn tại và đã được duyệt
      const restaurant = await tx.nha_hang.findUnique({
        where: { id: Number(value.nha_hang_id) }
      });

      if (!restaurant) {
        const err = new Error("Không tìm thấy nhà hàng");
        err.status = 404;
        throw err;
      }

      if (restaurant.trang_thai !== "DA_DUYET") {
        const err = new Error("Nhà hàng chưa được duyệt hoặc đang bị khóa");
        err.status = 400;
        throw err;
      }

      // 2. Kiểm tra địa chỉ giao hàng của user
      const address = await tx.dia_chi.findFirst({
        where: {
          id: Number(value.dia_chi_id),
          nguoi_dung_id: Number(userId)
        }
      });

      if (!address) {
        const err = new Error("Địa chỉ giao hàng không hợp lệ");
        err.status = 400;
        throw err;
      }

      // 3. Lấy items từ cart hoặc items trực tiếp
      let orderItems = [];
      let tongTien = 0;

      if (value.items && value.items.length > 0) {
        // Items trực tiếp
        for (const item of value.items) {
          const monAn = await tx.mon_an.findUnique({
            where: { id: Number(item.mon_an_id) }
          });

          if (!monAn) {
            const err = new Error(`Không tìm thấy món ăn với id ${item.mon_an_id}`);
            err.status = 404;
            throw err;
          }

          if (monAn.nha_hang_id !== Number(value.nha_hang_id)) {
            const err = new Error("Tất cả món ăn phải thuộc cùng một nhà hàng");
            err.status = 400;
            throw err;
          }

          if (monAn.trang_thai === "HET_HANG") {
            const err = new Error(`Món ${monAn.ten} đã hết hàng`);
            err.status = 400;
            throw err;
          }

          orderItems.push({
            mon_an_id: Number(item.mon_an_id),
            so_luong: Number(item.so_luong),
            gia: monAn.gia
          });

          tongTien += Number(monAn.gia) * Number(item.so_luong);
        }
      } else {
        // Lấy từ cart
        const cartItems = await tx.gio_hang.findMany({
          where: { nguoi_dung_id: Number(userId) },
          include: {
            mon_an: true
          }
        });

        if (cartItems.length === 0) {
          const err = new Error("Giỏ hàng trống");
          err.status = 400;
          throw err;
        }

        // Kiểm tra tất cả món cùng nhà hàng
        const nhaHangIds = new Set(cartItems.map(item => item.mon_an.nha_hang_id));
        if (nhaHangIds.size > 1) {
          const err = new Error("Giỏ hàng chứa món từ nhiều nhà hàng. Vui lòng đặt riêng.");
          err.status = 400;
          throw err;
        }

        if (!nhaHangIds.has(Number(value.nha_hang_id))) {
          const err = new Error("Giỏ hàng không chứa món từ nhà hàng này");
          err.status = 400;
          throw err;
        }

        // Kiểm tra món hết hàng
        for (const item of cartItems) {
          if (item.mon_an.trang_thai === "HET_HANG") {
            const err = new Error(`Món ${item.mon_an.ten} đã hết hàng`);
            err.status = 400;
            throw err;
          }
        }

        orderItems = cartItems.map(item => ({
          mon_an_id: item.mon_an_id,
          so_luong: item.so_luong,
          gia: item.mon_an.gia
        }));

        tongTien = cartItems.reduce((sum, item) => {
          return sum + Number(item.mon_an.gia) * Number(item.so_luong);
        }, 0);
      }

      // 4. Áp dụng voucher nếu có
      let giamGia = 0;
      if (value.voucher_id) {
        const voucher = await tx.voucher.findUnique({
          where: { id: Number(value.voucher_id) }
        });

        if (!voucher) {
          const err = new Error("Mã voucher không hợp lệ");
          err.status = 400;
          throw err;
        }

        const now = new Date();
        if (voucher.ngay_het_han < now) {
          const err = new Error("Mã voucher đã hết hạn");
          err.status = 400;
          throw err;
        }

        if (voucher.so_luong <= 0) {
          const err = new Error("Mã voucher đã hết lượt sử dụng");
          err.status = 400;
          throw err;
        }

        if (tongTien < Number(voucher.don_toi_thieu || 0)) {
          const err = new Error(`Đơn hàng phải từ ${voucher.don_toi_thieu}đ để sử dụng voucher này`);
          err.status = 400;
          throw err;
        }

        // Tính giảm giá
        if (voucher.loai_giam === "TIEN") {
          giamGia = Number(voucher.giam_gia);
        } else if (voucher.loai_giam === "PHAN_TRAM") {
          giamGia = tongTien * (Number(voucher.giam_gia) / 100);
        }

        // Giảm số lượng voucher
        await tx.voucher.update({
          where: { id: voucher.id },
          data: { so_luong: voucher.so_luong - 1 }
        });
      }

      const thanhTien = tongTien - giamGia;

      // 5. Tạo đơn hàng
      const order = await tx.don_hang.create({
        data: {
          nguoi_dung_id: Number(userId),
          nha_hang_id: Number(value.nha_hang_id),
          dia_chi_id: Number(value.dia_chi_id),
          voucher_id: value.voucher_id ? Number(value.voucher_id) : null,
          tong_tien: thanhTien,
          phuong_thuc_thanh_toan: value.phuong_thuc_thanh_toan,
          trang_thai: ORDER_STATUS.DA_TAO,
          ghi_chu: value.ghi_chu || null,
          chi_tiet_don_hang: {
            create: orderItems
          }
        },
        include: {
          nguoi_dung: { select: { id: true, ten: true } },
          nha_hang: { select: { id: true, ten: true } },
          voucher: { select: { ma: true, giam_gia: true } },
          chi_tiet_don_hang: {
            include: { mon_an: { select: { id: true, ten: true, gia: true } } }
          }
        }
      });

      // 6. Clear cart nếu order từ cart
      if (!value.items || value.items.length === 0) {
        await tx.gio_hang.deleteMany({
          where: { nguoi_dung_id: Number(userId) }
        });
      }

      return {
        ...order,
        tong_tien_goc: tongTien,
        giam_gia: giamGia
      };
    });
  }

  // User hủy đơn hàng
  async cancelOrder(orderId, userId) {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      const error = new Error("Không tìm thấy đơn hàng");
      error.status = 404;
      throw error;
    }

    if (order.nguoi_dung_id !== Number(userId)) {
      const error = new Error("Bạn không có quyền hủy đơn hàng này");
      error.status = 403;
      throw error;
    }

    if (!CAN_CANCEL_STATUS.includes(order.trang_thai)) {
      const error = new Error(`Không thể hủy đơn hàng ở trạng thái "${order.trang_thai}". Chỉ có thể hủy khi đơn đang ở trạng thái "DA_TAO" hoặc "NHA_HANG_XAC_NHAN".`);
      error.status = 400;
      throw error;
    }

    return await orderRepository.updateStatus(orderId, ORDER_STATUS.DA_HUY);
  }

  // Nhà hàng xác nhận đơn hàng
  async confirmOrder(orderId, restaurantId) {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      const error = new Error("Không tìm thấy đơn hàng");
      error.status = 404;
      throw error;
    }

    if (order.nha_hang_id !== Number(restaurantId)) {
      const error = new Error("Đơn hàng không thuộc về nhà hàng của bạn");
      error.status = 403;
      throw error;
    }

    if (!this.isValidTransition(order.trang_thai, ORDER_STATUS.NHA_HANG_XAC_NHAN)) {
      const error = new Error(`Không thể xác nhận đơn hàng ở trạng thái "${order.trang_thai}"`);
      error.status = 400;
      throw error;
    }

    return await orderRepository.updateStatus(orderId, ORDER_STATUS.NHA_HANG_XAC_NHAN);
  }

  // Nhà hàng từ chối đơn hàng
  async rejectOrder(orderId, restaurantId) {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      const error = new Error("Không tìm thấy đơn hàng");
      error.status = 404;
      throw error;
    }

    if (order.nha_hang_id !== Number(restaurantId)) {
      const error = new Error("Đơn hàng không thuộc về nhà hàng của bạn");
      error.status = 403;
      throw error;
    }

    if (!this.isValidTransition(order.trang_thai, ORDER_STATUS.DA_HUY)) {
      const error = new Error(`Không thể từ chối đơn hàng ở trạng thái "${order.trang_thai}"`);
      error.status = 400;
      throw error;
    }

    return await orderRepository.updateStatus(orderId, ORDER_STATUS.DA_HUY);
  }

  // Lấy đơn hàng chờ xác nhận của nhà hàng
  async getPendingOrders(restaurantId) {
    return await orderRepository.findPendingByRestaurant(restaurantId);
  }

  // Lấy đơn hàng của nhà hàng
  async getOrdersByRestaurant(restaurantId) {
    return await orderRepository.findByRestaurantId(restaurantId);
  }

  // Lấy đơn hàng khả dụng cho shipper
  async getAvailableOrdersForShipper() {
    return await orderRepository.findAvailableForShipper();
  }

  // Lấy đơn hàng hiện tại của shipper
  async getShipperCurrentOrders(shipperId) {
    return await orderRepository.findByShipperId(shipperId);
  }

  // Shipper nhận đơn hàng
  async acceptOrder(orderId, shipperId) {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      const error = new Error("Không tìm thấy đơn hàng");
      error.status = 404;
      throw error;
    }

    if (order.trang_thai !== ORDER_STATUS.NHA_HANG_XAC_NHAN) {
      const error = new Error("Đơn hàng không ở trạng thái chờ shipper");
      error.status = 400;
      throw error;
    }

    if (order.shipper_id) {
      const error = new Error("Đơn hàng đã có shipper nhận");
      error.status = 400;
      throw error;
    }

    if (!this.isValidTransition(order.trang_thai, ORDER_STATUS.DA_GAN_SHIPPER)) {
      const error = new Error(`Không thể nhận đơn ở trạng thái "${order.trang_thai}"`);
      error.status = 400;
      throw error;
    }

    return await orderRepository.updateStatus(orderId, ORDER_STATUS.DA_GAN_SHIPPER, shipperId);
  }

  // Shipper bắt đầu lấy hàng
  async startPickup(orderId, shipperId) {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      const error = new Error("Không tìm thấy đơn hàng");
      error.status = 404;
      throw error;
    }

    if (order.shipper_id !== Number(shipperId)) {
      const error = new Error("Bạn không phải shipper của đơn hàng này");
      error.status = 403;
      throw error;
    }

    if (!this.isValidTransition(order.trang_thai, ORDER_STATUS.DANG_LAY_HANG)) {
      const error = new Error(`Không thể bắt đầu lấy hàng ở trạng thái "${order.trang_thai}"`);
      error.status = 400;
      throw error;
    }

    return await orderRepository.updateStatus(orderId, ORDER_STATUS.DANG_LAY_HANG);
  }

  // Shipper bắt đầu giao hàng
  async startDelivery(orderId, shipperId) {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      const error = new Error("Không tìm thấy đơn hàng");
      error.status = 404;
      throw error;
    }

    if (order.shipper_id !== Number(shipperId)) {
      const error = new Error("Bạn không phải shipper của đơn hàng này");
      error.status = 403;
      throw error;
    }

    if (!this.isValidTransition(order.trang_thai, ORDER_STATUS.DANG_GIAO)) {
      const error = new Error(`Không thể bắt đầu giao hàng ở trạng thái "${order.trang_thai}"`);
      error.status = 400;
      throw error;
    }

    return await orderRepository.updateStatus(orderId, ORDER_STATUS.DANG_GIAO);
  }

  // Shipper hoàn thành giao hàng
  async completeDelivery(orderId, shipperId) {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      const error = new Error("Không tìm thấy đơn hàng");
      error.status = 404;
      throw error;
    }

    if (order.shipper_id !== Number(shipperId)) {
      const error = new Error("Bạn không phải shipper của đơn hàng này");
      error.status = 403;
      throw error;
    }

    if (!this.isValidTransition(order.trang_thai, ORDER_STATUS.HOAN_THANH)) {
      const error = new Error(`Không thể hoàn thành giao hàng ở trạng thái "${order.trang_thai}"`);
      error.status = 400;
      throw error;
    }

    return await orderRepository.updateStatus(orderId, ORDER_STATUS.HOAN_THANH);
  }

  // Lấy lịch sử đơn hàng của shipper
  async getShipperHistory(shipperId) {
    return await orderRepository.findHistoryByShipper(shipperId);
  }
}

module.exports = new OrderService();
