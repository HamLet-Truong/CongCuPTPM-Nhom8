const prisma = require("../../config/prisma");

class ReviewRepository {
  // Tìm đơn hàng theo orderId + userId để kiểm tra người gọi có phải chủ đơn hay không.
  async findOrderByIdAndUserId(orderId, userId) {
    return await prisma.don_hang.findFirst({
      where: {
        id: orderId,
        nguoi_dung_id: userId,
      },
      select: {
        id: true,
        nguoi_dung_id: true,
        nha_hang_id: true,
        trang_thai: true,
      },
    });
  }

  // Kiểm tra user đã từng review cho đơn này chưa (phục vụ chặn review trùng).
  async findReviewByOrderAndUser(orderId, userId) {
    return await prisma.danh_gia.findFirst({
      where: {
        nguoi_dung_id: userId,
        don_hang: {
          id: orderId,
          nguoi_dung_id: userId,
        },
      },
      select: {
        id: true,
      },
    });
  }

  // Thêm mới một bản ghi đánh giá vào bảng danh_gia.
  async createReview({ userId, restaurantId, diem, binhLuan }) {
    const review = await prisma.danh_gia.create({
      data: {
        nguoi_dung_id: userId,
        nha_hang_id: restaurantId,
        diem,
        binh_luan: binhLuan || null,
      },
    });

    return {
      id: review.id,
      nguoi_dung_id: review.nguoi_dung_id,
      nha_hang_id: review.nha_hang_id,
      diem: review.diem,
      binh_luan: review.binh_luan,
    };
  }

  // Lấy danh sách đánh giá theo nhà hàng (kèm tên người dùng để hiển thị).
  async getReviewsByRestaurantId(restaurantId) {
    const reviews = await prisma.danh_gia.findMany({
      where: {
        nha_hang_id: restaurantId,
      },
      select: {
        id: true,
        diem: true,
        binh_luan: true,
        nguoi_dung: {
          select: {
            ten: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return reviews.map((review) => ({
      id: review.id,
      diem: review.diem,
      binh_luan: review.binh_luan,
      ten_nguoi_dung: review.nguoi_dung.ten,
    }));
  }

  // Lấy tất cả đánh giá do chính user hiện tại đã tạo.
  async getReviewsByUserId(userId) {
    const reviews = await prisma.danh_gia.findMany({
      where: {
        nguoi_dung_id: userId,
      },
      select: {
        id: true,
        diem: true,
        binh_luan: true,
        nha_hang: {
          select: {
            ten: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return reviews.map((review) => ({
      id: review.id,
      diem: review.diem,
      binh_luan: review.binh_luan,
      ten_nha_hang: review.nha_hang.ten,
    }));
  }
}

module.exports = ReviewRepository;
