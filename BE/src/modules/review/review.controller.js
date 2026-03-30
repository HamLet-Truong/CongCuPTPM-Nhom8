const ReviewService = require("./review.service");
const { successResponse } = require("../../utils/response");

class ReviewController {
  constructor(reviewService = new ReviewService()) {
    this.reviewService = reviewService;
  }

  // POST /reviews: tạo mới review cho đơn hàng của user.
  createReview = async (req, res, next) => {
    try {
      const data = await this.reviewService.createReview({
        userId: req.user.id,
        orderId: req.body.orderId,
        diem: req.body.diem,
        binhLuan: req.body.binh_luan,
      });

      return successResponse(res, data, 201);
    } catch (error) {
      return next(error);
    }
  };

  // GET /reviews?restaurantId=1: lấy danh sách review theo nhà hàng.
  getReviewsByRestaurant = async (req, res, next) => {
    try {
      const data = await this.reviewService.getReviewsByRestaurantId(
        req.query.restaurantId,
      );

      return successResponse(res, data, 200);
    } catch (error) {
      return next(error);
    }
  };

  // GET /reviews/me: lấy danh sách review do chính user hiện tại đã tạo.
  getMyReviews = async (req, res, next) => {
    try {
      const data = await this.reviewService.getMyReviews(req.user.id);
      return successResponse(res, data, 200);
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = ReviewController;
