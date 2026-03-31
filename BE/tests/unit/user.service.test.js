const userService = require("../../src/modules/user/user.service");
const userRepository = require("../../src/modules/user/user.repository");

jest.mock("../../src/modules/user/user.repository");

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getProfile throws Error khi không tìm thấy user", async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(userService.getProfile(999)).rejects.toThrow("Người dùng không tồn tại");
  });

  test("getProfile trả về user profile hợp lệ", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      ten: "Test User",
      dia_chi: []
    };
    userRepository.findById.mockResolvedValue(mockUser);

    const result = await userService.getProfile(1);
    expect(result).toEqual(mockUser);
    expect(userRepository.findById).toHaveBeenCalledWith(1);
  });
});
