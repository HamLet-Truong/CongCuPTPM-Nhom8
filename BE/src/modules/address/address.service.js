const addressRepository = require("./address.repository");

class AddressService {
  async getAllByUserId(userId) {
    return await addressRepository.findAllByUserId(userId);
  }

  async create(userId, data) {
    if (!data.dia_chi) {
      throw new Error("Địa chỉ là bắt buộc");
    }
    
    // Nếu là địa chỉ đầu tiên, luôn set làm mặc định
    const count = await addressRepository.countByUserId(userId);
    const isFirstAddress = count === 0;
    
    const payload = {
      nguoi_dung_id: userId,
      dia_chi: data.dia_chi,
      mac_dinh: isFirstAddress ? true : Boolean(data.mac_dinh),
      is_active: true
    };

    return await addressRepository.create(userId, payload);
  }

  async update(userId, addressId, data) {
    const addressIdInt = parseInt(addressId, 10);
    const address = await addressRepository.findById(addressIdInt);

    if (!address || !address.is_active) {
      throw new Error("Không tìm thấy địa chỉ");
    }

    if (address.nguoi_dung_id !== userId) {
      throw new Error("Bạn không quyền sửa địa chỉ này");
    }

    const payload = {
      ...(data.dia_chi && { dia_chi: data.dia_chi }),
      ...(data.mac_dinh !== undefined && { mac_dinh: Boolean(data.mac_dinh) })
    };

    return await addressRepository.update(userId, addressIdInt, payload);
  }

  async delete(userId, addressId) {
    const addressIdInt = parseInt(addressId, 10);
    const address = await addressRepository.findById(addressIdInt);

    if (!address || !address.is_active) {
      throw new Error("Không tìm thấy địa chỉ");
    }

    if (address.nguoi_dung_id !== userId) {
      throw new Error("Bạn không quyền xoá địa chỉ này");
    }

    return await addressRepository.softDelete(addressIdInt);
  }
}

module.exports = new AddressService();
