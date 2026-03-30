const restaurantService = require("./restaurant.service");

class RestaurantController {
  async list(req, res, next) {
    try {
      const result = await restaurantService.list(req.query);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async detail(req, res, next) {
    try {
      const { id } = req.params;
      const result = await restaurantService.getById(id);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async approve(req, res, next) {
    try {
      const { id } = req.params;
      const result = await restaurantService.approve(id);
      return res.status(200).json({ success: true, message: "Duyệt nhà hàng thành công", data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RestaurantController();
