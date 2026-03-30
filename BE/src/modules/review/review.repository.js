const pool = require("../../database/connection");

class ReviewRepository {
  // Tìm đơn hàng theo orderId + userId để kiểm tra người gọi có phải chủ đơn hay không.
  async findOrderByIdAndUserId(orderId, userId) {
    const [rows] = await pool.execute(
      `
      SELECT id, nguoi_dung_id, nha_hang_id, trang_thai
      FROM don_hang
      WHERE id = ? AND nguoi_dung_id = ?
      LIMIT 1
      `,
      [orderId, userId],
    );

    return rows[0] || null;
  }

  // Kiểm tra user đã từng review cho đơn này chưa (phục vụ chặn review trùng).
  async findReviewByOrderAndUser(orderId, userId) {
    const [rows] = await pool.execute(
      `
      SELECT dg.id
      FROM danh_gia dg
      INNER JOIN don_hang dh
        ON dh.nha_hang_id = dg.nha_hang_id
       AND dh.nguoi_dung_id = dg.nguoi_dung_id
      WHERE dh.id = ?
        AND dg.nguoi_dung_id = ?
      LIMIT 1
      `,
      [orderId, userId],
    );

    return rows[0] || null;
  }

  // Thêm mới một bản ghi đánh giá vào bảng danh_gia.
  async createReview({ userId, restaurantId, diem, binhLuan }) {
    const [result] = await pool.execute(
      `
      INSERT INTO danh_gia (nguoi_dung_id, nha_hang_id, diem, binh_luan)
      VALUES (?, ?, ?, ?)
      `,
      [userId, restaurantId, diem, binhLuan || null],
    );

    return {
      id: result.insertId,
      nguoi_dung_id: userId,
      nha_hang_id: restaurantId,
      diem,
      binh_luan: binhLuan || null,
    };
  }

  // Lấy danh sách đánh giá theo nhà hàng (kèm tên người dùng để hiển thị).
  async getReviewsByRestaurantId(restaurantId) {
    const [rows] = await pool.execute(
      `
      SELECT dg.id, dg.diem, dg.binh_luan, nd.ten AS ten_nguoi_dung
      FROM danh_gia dg
      INNER JOIN nguoi_dung nd ON nd.id = dg.nguoi_dung_id
      WHERE dg.nha_hang_id = ?
      ORDER BY dg.id DESC
      `,
      [restaurantId],
    );

    return rows;
  }

  // Lấy tất cả đánh giá do chính user hiện tại đã tạo.
  async getReviewsByUserId(userId) {
    const [rows] = await pool.execute(
      `
      SELECT dg.id, dg.diem, dg.binh_luan, nh.ten AS ten_nha_hang
      FROM danh_gia dg
      INNER JOIN nha_hang nh ON nh.id = dg.nha_hang_id
      WHERE dg.nguoi_dung_id = ?
      ORDER BY dg.id DESC
      `,
      [userId],
    );

    return rows;
  }
}

module.exports = ReviewRepository;
