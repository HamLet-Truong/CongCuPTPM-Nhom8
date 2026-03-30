const express = require("express");
const ReviewController = require("./review.controller");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");

const router = express.Router();
const reviewController = new ReviewController();

// Endpoint tạo review: yêu cầu đăng nhập và đúng vai trò USER.
router.post("/", authenticate, authorize("USER"), reviewController.createReview);

// Endpoint xem review theo nhà hàng: public để mọi người có thể xem đánh giá.
router.get("/", reviewController.getReviewsByRestaurant);

// Endpoint lấy review của chính user hiện tại: yêu cầu đăng nhập USER.
router.get("/me", authenticate, authorize("USER"), reviewController.getMyReviews);

module.exports = router;
