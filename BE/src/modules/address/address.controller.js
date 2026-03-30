const addressService = require("./address.service");

class AddressController {
  async getAddresses(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await addressService.getAllByUserId(userId);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async createAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await addressService.create(userId, req.body);

      return res.status(201).json({
        success: true,
        message: "Tạo địa chỉ thành công",
        data: result
      });
    } catch (error) {
      if (error.message === "Địa chỉ là bắt buộc") {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async updateAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await addressService.update(userId, id, req.body);

      return res.status(200).json({
        success: true,
        message: "Cập nhật địa chỉ thành công",
        data: result
      });
    } catch (error) {
      if (error.message === "Không tìm thấy địa chỉ") {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === "Bạn không quyền sửa địa chỉ này") {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async deleteAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await addressService.delete(userId, id);

      return res.status(200).json({
        success: true,
        message: "Xoá địa chỉ thành công"
      });
    } catch (error) {
      if (error.message === "Không tìm thấy địa chỉ") {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === "Bạn không quyền xoá địa chỉ này") {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}

module.exports = new AddressController();
