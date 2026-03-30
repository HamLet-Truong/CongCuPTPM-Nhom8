const Joi = require("joi");
const cartRepository = require("./cart.repository");

class CartService {
  addToCartSchema = Joi.object({
    mon_an_id: Joi.number().integer().positive().required().messages({
      "number.base": "mon_an_id phải là số",
      "number.positive": "mon_an_id phải lớn hơn 0",
      "any.required": "mon_an_id là bắt buộc"
    }),
    so_luong: Joi.number().integer().positive().default(1).messages({
      "number.base": "Số lượng phải là số",
      "number.positive": "Số lượng phải lớn hơn 0"
    })
  });

  updateCartSchema = Joi.object({
    so_luong: Joi.number().integer().positive().required().messages({
      "number.base": "Số lượng phải là số",
      "number.positive": "Số lượng phải lớn hơn 0",
      "any.required": "Số lượng là bắt buộc"
    })
  });

  async getCart(userId) {
    return await cartRepository.findByUserId(userId);
  }

  async addToCart(userId, data) {
    const { error, value } = this.addToCartSchema.validate(data, { abortEarly: false });
    if (error) {
      const validationError = new Error(error.details.map(d => d.message).join(", "));
      validationError.status = 400;
      throw validationError;
    }

    // Kiểm tra nếu đã có trong giỏ hàng → tăng số lượng
    const existing = await cartRepository.findByUserAndFood(userId, value.mon_an_id);
    if (existing) {
      return await cartRepository.updateQuantity(existing.id, existing.so_luong + value.so_luong);
    }

    return await cartRepository.create({
      nguoi_dung_id: userId,
      mon_an_id: value.mon_an_id,
      so_luong: value.so_luong
    });
  }

  async updateCartItem(userId, id, data) {
    const cartItem = await cartRepository.findById(id);
    if (!cartItem) {
      const error = new Error("Không tìm thấy item trong giỏ hàng");
      error.status = 404;
      throw error;
    }

    if (cartItem.nguoi_dung_id !== Number(userId)) {
      const error = new Error("Bạn không có quyền sửa item này");
      error.status = 403;
      throw error;
    }

    const { error, value } = this.updateCartSchema.validate(data, { abortEarly: false });
    if (error) {
      const validationError = new Error(error.details.map(d => d.message).join(", "));
      validationError.status = 400;
      throw validationError;
    }

    return await cartRepository.updateQuantity(id, value.so_luong);
  }

  async removeCartItem(userId, id) {
    const cartItem = await cartRepository.findById(id);
    if (!cartItem) {
      const error = new Error("Không tìm thấy item trong giỏ hàng");
      error.status = 404;
      throw error;
    }

    if (cartItem.nguoi_dung_id !== Number(userId)) {
      const error = new Error("Bạn không có quyền xóa item này");
      error.status = 403;
      throw error;
    }

    return await cartRepository.delete(id);
  }
}

module.exports = new CartService();
