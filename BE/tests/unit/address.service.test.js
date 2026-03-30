const addressService = require("../../src/modules/address/address.service");
const addressRepository = require("../../src/modules/address/address.repository");

jest.mock("../../src/modules/address/address.repository");

describe("AddressService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    test("thiết lập mặc định nếu là địa chỉ đầu tiên", async () => {
      addressRepository.countByUserId.mockResolvedValue(0);
      addressRepository.create.mockResolvedValue({ id: 1, mac_dinh: true });

      await addressService.create(1, { dia_chi: "123 Street" });

      expect(addressRepository.create).toHaveBeenCalledWith(1, {
        nguoi_dung_id: 1,
        dia_chi: "123 Street",
        mac_dinh: true,
        is_active: true
      });
    });

    test("thiết lập theo data.mac_dinh nếu không phải địa chỉ đầu tiên", async () => {
      addressRepository.countByUserId.mockResolvedValue(1);
      addressRepository.create.mockResolvedValue({ id: 2, mac_dinh: false });

      await addressService.create(1, { dia_chi: "456 Street", mac_dinh: false });

      expect(addressRepository.create).toHaveBeenCalledWith(1, {
        nguoi_dung_id: 1,
        dia_chi: "456 Street",
        mac_dinh: false,
        is_active: true
      });
    });

    test("throw error nếu thiếu địa chỉ", async () => {
      await expect(addressService.create(1, {})).rejects.toThrow("Địa chỉ là bắt buộc");
    });
  });

  describe("update", () => {
    test("throw error nếu address không tồn tại hoặc is_active=false", async () => {
      addressRepository.findById.mockResolvedValue(null);
      await expect(addressService.update(1, 1, { dia_chi: "New" })).rejects.toThrow("Không tìm thấy địa chỉ");

      addressRepository.findById.mockResolvedValue({ is_active: false });
      await expect(addressService.update(1, 1, { dia_chi: "New" })).rejects.toThrow("Không tìm thấy địa chỉ");
    });

    test("throw error nếu sửa địa chỉ của người khác", async () => {
      addressRepository.findById.mockResolvedValue({ is_active: true, nguoi_dung_id: 2 });
      await expect(addressService.update(1, 1, { dia_chi: "New" })).rejects.toThrow("Bạn không quyền sửa địa chỉ này");
    });

    test("update hợp lệ", async () => {
      addressRepository.findById.mockResolvedValue({ is_active: true, nguoi_dung_id: 1 });
      addressRepository.update.mockResolvedValue({ id: 1 });

      await addressService.update(1, "1", { dia_chi: "New Addr", mac_dinh: true });
      expect(addressRepository.update).toHaveBeenCalledWith(1, 1, { dia_chi: "New Addr", mac_dinh: true });
    });
  });

  describe("delete", () => {
    test("softDelete gọi thành công", async () => {
      addressRepository.findById.mockResolvedValue({ id: 1, is_active: true, nguoi_dung_id: 1 });
      addressRepository.softDelete.mockResolvedValue({ id: 1, is_active: false });

      await addressService.delete(1, 1);
      expect(addressRepository.softDelete).toHaveBeenCalledWith(1);
    });

    test("throw error nếu address xoá không thuộc sở hữu", async () => {
      addressRepository.findById.mockResolvedValue({ id: 1, is_active: true, nguoi_dung_id: 2 });
      await expect(addressService.delete(1, 1)).rejects.toThrow("Bạn không quyền xoá địa chỉ này");
    });
  });
});
