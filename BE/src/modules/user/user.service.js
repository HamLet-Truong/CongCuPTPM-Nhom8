const userRepository = require("./user.repository");

class UserService {
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("Người dùng không tồn tại"); // Usually handled by a custom Error class, but Error is fine generic fallback
    }
    return user;
  }
}

module.exports = new UserService();
