const ReviewService = require("../../src/modules/review/review.service");
const AppError = require("../../src/utils/appError");

describe("ReviewService", () => {
  let reviewRepositoryMock;
  let reviewService;

  beforeEach(() => {
    // Mock repository để test chỉ tập trung vào business logic của tầng service.
    reviewRepositoryMock = {
      findOrderByIdAndUserId: jest.fn(),
      findReviewByOrderAndUser: jest.fn(),
      createReview: jest.fn(),
      getReviewsByRestaurantId: jest.fn(),
      getReviewsByUserId: jest.fn(),
    };

    reviewService = new ReviewService(reviewRepositoryMock);
  });

  test("throws 400 khi thiếu orderId", async () => {
    await expect(
      reviewService.createReview({ userId: 1, diem: 5, binhLuan: "ok" }),
    ).rejects.toMatchObject({
      status: 400,
      message: "orderId là bắt buộc và phải là số",
    });
  });

  test("throws 404 khi order không thuộc user", async () => {
    reviewRepositoryMock.findOrderByIdAndUserId.mockResolvedValue(null);

    await expect(
      reviewService.createReview({ userId: 1, orderId: 10, diem: 4 }),
    ).rejects.toMatchObject({
      status: 404,
      message: "Không tìm thấy đơn hàng của bạn",
    });
  });

  test("throws 400 khi order chưa HOAN_THANH", async () => {
    reviewRepositoryMock.findOrderByIdAndUserId.mockResolvedValue({
      id: 10,
      nha_hang_id: 2,
      trang_thai: "DANG_GIAO",
    });

    await expect(
      reviewService.createReview({ userId: 1, orderId: 10, diem: 4 }),
    ).rejects.toMatchObject({
      status: 400,
      message: "Chỉ được review khi đơn hàng đã HOAN_THANH",
    });
  });

  test("throws 409 khi review trùng", async () => {
    reviewRepositoryMock.findOrderByIdAndUserId.mockResolvedValue({
      id: 10,
      nha_hang_id: 2,
      trang_thai: "HOAN_THANH",
    });
    reviewRepositoryMock.findReviewByOrderAndUser.mockResolvedValue({ id: 99 });

    await expect(
      reviewService.createReview({ userId: 1, orderId: 10, diem: 4 }),
    ).rejects.toMatchObject({
      status: 409,
      message: "Bạn đã review đơn hàng này rồi",
    });
  });

  test("createReview trả dữ liệu thành công khi hợp lệ", async () => {
    reviewRepositoryMock.findOrderByIdAndUserId.mockResolvedValue({
      id: 10,
      nha_hang_id: 2,
      trang_thai: "HOAN_THANH",
    });
    reviewRepositoryMock.findReviewByOrderAndUser.mockResolvedValue(null);
    reviewRepositoryMock.createReview.mockResolvedValue({
      id: 101,
      nguoi_dung_id: 1,
      nha_hang_id: 2,
      diem: 5,
      binh_luan: "Ngon",
    });

    const result = await reviewService.createReview({
      userId: 1,
      orderId: 10,
      diem: 5,
      binhLuan: "Ngon",
    });

    expect(result).toEqual({
      id: 101,
      nguoi_dung_id: 1,
      nha_hang_id: 2,
      diem: 5,
      binh_luan: "Ngon",
      order_id: 10,
    });
    expect(reviewRepositoryMock.createReview).toHaveBeenCalledTimes(1);
  });

  test("getReviewsByRestaurantId trả danh sách review", async () => {
    reviewRepositoryMock.getReviewsByRestaurantId.mockResolvedValue([
      { id: 1, diem: 5, binh_luan: "Tốt" },
    ]);

    const result = await reviewService.getReviewsByRestaurantId(2);

    expect(result).toEqual({
      restaurantId: 2,
      total: 1,
      reviews: [{ id: 1, diem: 5, binh_luan: "Tốt" }],
    });
  });

  test("getReviewsByRestaurantId throws 400 khi restaurantId không hợp lệ", async () => {
    await expect(reviewService.getReviewsByRestaurantId("abc")).rejects.toEqual(
      new AppError("restaurantId là bắt buộc và phải là số", 400),
    );
  });
});
