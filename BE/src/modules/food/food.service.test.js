const foodService = require("./food.service");
const foodRepository = require("./food.repository");

// Mock the repository
jest.mock("./food.repository");

describe("FoodService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createFood", () => {
    it("should create food successfully", async () => {
      const nhaHangId = 1;
      const data = { ten: "Phở bò", gia: 50000 };
      const expectedOutput = { id: 1, ...data, nha_hang_id: nhaHangId };

      foodRepository.create.mockResolvedValue(expectedOutput);

      const result = await foodService.createFood(nhaHangId, data);
      expect(result).toEqual(expectedOutput);
      expect(foodRepository.create).toHaveBeenCalledWith({
        ...data,
        nha_hang_id: nhaHangId,
      });
    });

    it("should throw error if missing name or price", async () => {
      const nhaHangId = 1;
      const data = { ten: "Phở bò" }; // missing gia
      
      await expect(foodService.createFood(nhaHangId, data)).rejects.toThrow("Tên món ăn và giá là bắt buộc");
    });
  });

  describe("updateFood", () => {
    it("should update food successfully when owner matches", async () => {
      const nhaHangId = 1;
      const id = 10;
      const currentFood = { id: 10, ten: "Phở gà", gia: 40000, nha_hang_id: 1 };
      const updateData = { ten: "Phở bò", gia: 50000 };
      const expectedOutput = { ...currentFood, ...updateData };

      foodRepository.findById.mockResolvedValue(currentFood);
      foodRepository.update.mockResolvedValue(expectedOutput);

      const result = await foodService.updateFood(nhaHangId, id, updateData);
      
      expect(result).toEqual(expectedOutput);
      expect(foodRepository.update).toHaveBeenCalledWith(id, updateData);
    });

    it("should throw error if food not found", async () => {
      const nhaHangId = 1;
      const id = 10;
      
      foodRepository.findById.mockResolvedValue(null);

      await expect(foodService.updateFood(nhaHangId, id, {})).rejects.toThrow("Không tìm thấy món ăn");
    });

    it("should throw error if restaurant is not the owner", async () => {
      const nhaHangId = 2; // Different from owner
      const id = 10;
      const currentFood = { id: 10, ten: "Phở gà", gia: 40000, nha_hang_id: 1 };
      const updateData = { ten: "Phở bò", gia: 50000 };

      foodRepository.findById.mockResolvedValue(currentFood);

      await expect(foodService.updateFood(nhaHangId, id, updateData)).rejects.toThrow("Bạn không có quyền sửa món ăn này");
      expect(foodRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteFood", () => {
    it("should delete food successfully when owner matches", async () => {
      const nhaHangId = 1;
      const id = 10;
      const currentFood = { id: 10, ten: "Phở gà", gia: 40000, nha_hang_id: 1 };

      foodRepository.findById.mockResolvedValue(currentFood);
      foodRepository.delete.mockResolvedValue(currentFood);

      await foodService.deleteFood(nhaHangId, id);
      
      expect(foodRepository.delete).toHaveBeenCalledWith(id);
    });

    it("should throw error if restaurant is not the owner", async () => {
      const nhaHangId = 2; // Different
      const id = 10;
      const currentFood = { id: 10, ten: "Phở gà", gia: 40000, nha_hang_id: 1 };

      foodRepository.findById.mockResolvedValue(currentFood);

      await expect(foodService.deleteFood(nhaHangId, id)).rejects.toThrow("Bạn không có quyền xóa món ăn này");
      expect(foodRepository.delete).not.toHaveBeenCalled();
    });
  });
});
