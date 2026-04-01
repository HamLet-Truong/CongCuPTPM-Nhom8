const Joi = require("joi");
const foodRepository = require("./food.repository");

class FoodService {
  // Validation schemas
  createFoodSchema = Joi.object({
    ten: Joi.string().required().messages({
      "string.empty": "Tên món ăn không được để trống",
      "any.required": "Tên món ăn là bắt buộc"
    }),
    mo_ta: Joi.string().allow("", null).optional(),
    gia: Joi.number().min(0).required().messages({
      "number.base": "Giá phải là số",
      "number.min": "Giá không được nhỏ hơn 0",
      "any.required": "Giá là bắt buộc"
    }),
    hinh_anh: Joi.string().uri().allow("", null).optional().messages({
      "string.uri": "Hình ảnh phải là URL hợp lệ"
    }),
    trang_thai: Joi.string().valid("CON_HANG", "HET_HANG").optional()
  });

  updateFoodSchema = Joi.object({
    ten: Joi.string().messages({
      "string.empty": "Tên món ăn không được để trống"
    }),
    mo_ta: Joi.string().allow("", null).optional(),
    gia: Joi.number().min(0).messages({
      "number.base": "Giá phải là số",
      "number.min": "Giá không được nhỏ hơn 0"
    }),
    hinh_anh: Joi.string().uri().allow("", null).optional().messages({
      "string.uri": "Hình ảnh phải là URL hợp lệ"
    }),
    trang_thai: Joi.string().valid("CON_HANG", "HET_HANG").optional()
  }).min(1).messages({
    "object.min": "Phải cập nhật ít nhất một trường"
  });

  async getAllFoods(nhaHangId) {
    return await foodRepository.findAll(nhaHangId);
  }

  async getFoodById(id) {
    const food = await foodRepository.findById(id);
    if (!food) {
      const error = new Error("Không tìm thấy món ăn");
      error.status = 404;
      throw error;
    }
    return food;
  }

  async createFood(nhaHangId, data) {
    // Validate input
    const { error, value } = this.createFoodSchema.validate(data, { abortEarly: false });
    if (error) {
      const validationError = new Error(error.details.map(d => d.message).join(", "));
      validationError.status = 400;
      throw validationError;
    }

    const payload = {
      ...value,
      nha_hang_id: nhaHangId
    };

    return await foodRepository.create(payload);
  }

  async updateFood(nhaHangId, id, data) {
    const food = await this.getFoodById(id);

    // Validate ownership
    if (food.nha_hang_id !== Number(nhaHangId)) {
      const error = new Error("Bạn không có quyền sửa món ăn này");
      error.status = 403;
      throw error;
    }

    // Validate input
    const { error, value } = this.updateFoodSchema.validate(data, { abortEarly: false });
    if (error) {
      const validationError = new Error(error.details.map(d => d.message).join(", "));
      validationError.status = 400;
      throw validationError;
    }

    return await foodRepository.update(id, value);
  }

  async deleteFood(nhaHangId, id) {
    const food = await this.getFoodById(id);

    // Validate ownership
    if (food.nha_hang_id !== Number(nhaHangId)) {
      const error = new Error("Bạn không có quyền xóa món ăn này");
      error.status = 403;
      throw error;
    }

    return await foodRepository.delete(id);
  }
}

module.exports = new FoodService();
