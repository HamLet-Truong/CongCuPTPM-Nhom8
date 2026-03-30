const foodService = require("./food.service");

class FoodController {
  async getAllFoods(req, res, next) {
    try {
      const { nhaHangId } = req.query;
      const foods = await foodService.getAllFoods(nhaHangId);
      res.status(200).json({
        success: true,
        data: foods
      });
    } catch (error) {
      next(error);
    }
  }

  async createFood(req, res, next) {
    try {
      const nhaHangId = req.user.id; // User id in this context is the nha_hang_id
      const food = await foodService.createFood(nhaHangId, req.body);
      res.status(201).json({
        success: true,
        message: "Tạo món ăn thành công",
        data: food
      });
    } catch (error) {
      next(error);
    }
  }

  async updateFood(req, res, next) {
    try {
      const nhaHangId = req.user.id;
      const { id } = req.params;
      const food = await foodService.updateFood(nhaHangId, id, req.body);
      res.status(200).json({
        success: true,
        message: "Cập nhật món ăn thành công",
        data: food
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteFood(req, res, next) {
    try {
      const nhaHangId = req.user.id;
      const { id } = req.params;
      await foodService.deleteFood(nhaHangId, id);
      res.status(200).json({
        success: true,
        message: "Xóa món ăn thành công"
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FoodController();
