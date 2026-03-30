const restaurantRepository = require("./restaurant.repository");

class RestaurantService {
  async list(query = {}) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    // Only show approved restaurants by default for public list
    const status = query.status || 'DA_DUYET';

    const { data, total } = await restaurantRepository.findMany({ page, limit, status });

    const totalPages = Math.ceil(total / limit);

    return {
      meta: {
        total,
        page,
        limit,
        totalPages
      },
      data
    };
  }

  async getById(id) {
    const restaurant = await restaurantRepository.findById(id);
    if (!restaurant) {
      const error = new Error("Không tìm thấy nhà hàng");
      error.status = 404;
      throw error;
    }
    return restaurant;
  }

  async approve(id) {
    const restaurant = await restaurantRepository.findById(id);
    if (!restaurant) {
      const error = new Error("Không tìm thấy nhà hàng");
      error.status = 404;
      throw error;
    }

    if (restaurant.trang_thai === 'DA_DUYET') {
      const error = new Error("Nhà hàng đã được duyệt");
      error.status = 400;
      throw error;
    }

    const updated = await restaurantRepository.updateStatus(id, 'DA_DUYET');
    return updated;
  }
}

module.exports = new RestaurantService();
