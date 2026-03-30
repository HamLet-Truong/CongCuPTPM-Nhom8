const foodRepository = require("./food.repository");

class FoodService {
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
    if (!data.ten || data.gia === undefined) {
      const error = new Error("Tên món ăn và giá là bắt buộc");
      error.status = 400;
      throw error;
    }

    const payload = {
      ...data,
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

    return await foodRepository.update(id, data);
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
