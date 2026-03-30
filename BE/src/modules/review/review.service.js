const AppError = require("../../utils/appError");

class ReviewService {
  constructor(reviewRepository) {
    // Nếu unit test truyền mock repository thì dùng luôn để không kết nối DB thật.
    if (reviewRepository) {
      this.reviewRepository = reviewRepository;
      return;
    }

    // Lazy require giúp hạn chế mở kết nối MySQL sớm khi không cần thiết.
    const ReviewRepository = require("./review.repository");
    this.reviewRepository = new ReviewRepository();
  }

  // Validate input tạo review: bắt buộc orderId/diem và diem nằm trong khoảng 1-5.
  validateCreateInput({ orderId, diem }) {
    if (!orderId || Number.isNaN(Number(orderId))) {
      throw new AppError("orderId là bắt buộc và phải là số", 400);
    }

    if (!diem || Number.isNaN(Number(diem))) {
      throw new AppError("diem là bắt buộc và phải là số", 400);
    }

    const numericDiem = Number(diem);
    if (numericDiem < 1 || numericDiem > 5) {
      throw new AppError("diem phải nằm trong khoảng từ 1 đến 5", 400);
    }

    return {
      orderId: Number(orderId),
      diem: numericDiem,
    };
  }

  // Tạo review theo đúng business rule:
  // 1) Đơn phải thuộc về user hiện tại.
  // 2) Đơn phải ở trạng thái HOAN_THANH.
  // 3) Không cho review trùng.
  async createReview({ userId, orderId, diem, binhLuan }) {
    const validated = this.validateCreateInput({ orderId, diem });

    const order = await this.reviewRepository.findOrderByIdAndUserId(
      validated.orderId,
      userId,
    );

    if (!order) {
      throw new AppError("Không tìm thấy đơn hàng của bạn", 404);
    }

    if (order.trang_thai !== "HOAN_THANH") {
      throw new AppError("Chỉ được review khi đơn hàng đã HOAN_THANH", 400);
    }

    const existedReview = await this.reviewRepository.findReviewByOrderAndUser(
      validated.orderId,
      userId,
    );

    if (existedReview) {
      throw new AppError("Bạn đã review đơn hàng này rồi", 409);
    }

    const review = await this.reviewRepository.createReview({
      userId,
      restaurantId: order.nha_hang_id,
      diem: validated.diem,
      binhLuan,
    });

    return {
      ...review,
      order_id: validated.orderId,
    };
  }

  // Lấy danh sách review theo nhà hàng, trả kèm tổng số bản ghi.
  async getReviewsByRestaurantId(restaurantId) {
    const normalizedRestaurantId = Number(restaurantId);

    if (!normalizedRestaurantId || Number.isNaN(normalizedRestaurantId)) {
      throw new AppError("restaurantId là bắt buộc và phải là số", 400);
    }

    const reviews = await this.reviewRepository.getReviewsByRestaurantId(
      normalizedRestaurantId,
    );

    return {
      restaurantId: normalizedRestaurantId,
      total: reviews.length,
      reviews,
    };
  }

  // Lấy danh sách review của user hiện tại, trả kèm tổng số bản ghi.
  async getMyReviews(userId) {
    const reviews = await this.reviewRepository.getReviewsByUserId(userId);

    return {
      total: reviews.length,
      reviews,
    };
  }
}

module.exports = ReviewService;
