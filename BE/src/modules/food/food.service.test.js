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

    it("should throw error if name is missing", async () => {
      const nhaHangId = 1;
      const data = { gia: 50000 }; // missing ten
      
      await expect(foodService.createFood(nhaHangId, data)).rejects.toThrow();
    });

    it("should throw error if price is missing", async () => {
      const nhaHangId = 1;
      const data = { ten: "Phở bò" }; // missing gia
      
      await expect(foodService.createFood(nhaHangId, data)).rejects.toThrow();
    });

    it("should throw error if price is non-positive", async () => {
      const nhaHangId = 1;
      const data = { ten: "Phở bò", gia: -50000 };
      
      await expect(foodService.createFood(nhaHangId, data)).rejects.toThrow();
    });

    it("should throw error if name is empty string", async () => {
      const nhaHangId = 1;
      const data = { ten: "", gia: 50000 };
      
      await expect(foodService.createFood(nhaHangId, data)).rejects.toThrow();
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

    it("should throw error if price is invalid", async () => {
      const nhaHangId = 1;
      const id = 10;
      const currentFood = { id: 10, ten: "Phở gà", gia: 40000, nha_hang_id: 1 };
      const updateData = { gia: -10000 };

      foodRepository.findById.mockResolvedValue(currentFood);

      await expect(foodService.updateFood(nhaHangId, id, updateData)).rejects.toThrow();
      expect(foodRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error if no update data provided", async () => {
      const nhaHangId = 1;
      const id = 10;
      const currentFood = { id: 10, ten: "Phở gà", gia: 40000, nha_hang_id: 1 };

      foodRepository.findById.mockResolvedValue(currentFood);

      await expect(foodService.updateFood(nhaHangId, id, {})).rejects.toThrow();
      expect(foodRepository.update).not.toHaveBeenCalled();
    });

    it("should update only name when provided", async () => {
      const nhaHangId = 1;
      const id = 10;
      const currentFood = { id: 10, ten: "Phở gà", gia: 40000, nha_hang_id: 1 };
      const updateData = { ten: "Phở bò" };
      const expectedOutput = { ...currentFood, ten: "Phở bò" };

      foodRepository.findById.mockResolvedValue(currentFood);
      foodRepository.update.mockResolvedValue(expectedOutput);

      const result = await foodService.updateFood(nhaHangId, id, updateData);
      
      expect(result).toEqual(expectedOutput);
      expect(foodRepository.update).toHaveBeenCalledWith(id, updateData);
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

    it("should throw error if food not found", async () => {
      const nhaHangId = 1;
      const id = 10;
      
      foodRepository.findById.mockResolvedValue(null);

      await expect(foodService.deleteFood(nhaHangId, id)).rejects.toThrow("Không tìm thấy món ăn");
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

  describe("getAllFoods", () => {
    it("should get all foods without filter", async () => {
      const mockFoods = [
        { id: 1, ten: "Phở bò", gia: 50000, nha_hang_id: 1 },
        { id: 2, ten: "Bánh mì", gia: 20000, nha_hang_id: 2 }
      ];

      foodRepository.findAll.mockResolvedValue(mockFoods);

      const result = await foodService.getAllFoods();
      
      expect(result).toEqual(mockFoods);
      expect(foodRepository.findAll).toHaveBeenCalledWith(undefined);
    });

    it("should get foods filtered by restaurant", async () => {
      const nhaHangId = 1;
      const mockFoods = [
        { id: 1, ten: "Phở bò", gia: 50000, nha_hang_id: 1 },
        { id: 3, ten: "Cơm tấm", gia: 30000, nha_hang_id: 1 }
      ];

      foodRepository.findAll.mockResolvedValue(mockFoods);

      const result = await foodService.getAllFoods(nhaHangId);
      
      expect(result).toEqual(mockFoods);
      expect(foodRepository.findAll).toHaveBeenCalledWith(nhaHangId);
    });

    it("should return empty array when no foods found", async () => {
      foodRepository.findAll.mockResolvedValue([]);

      const result = await foodService.getAllFoods(999);
      
      expect(result).toEqual([]);
    });
  });

  describe("getFoodById", () => {
    it("should get food by id successfully", async () => {
      const id = 1;
      const mockFood = { id: 1, ten: "Phở bò", gia: 50000, nha_hang_id: 1 };

      foodRepository.findById.mockResolvedValue(mockFood);

      const result = await foodService.getFoodById(id);
      
      expect(result).toEqual(mockFood);
      expect(foodRepository.findById).toHaveBeenCalledWith(id);
    });

    it("should throw error if food not found", async () => {
      const id = 999;

      foodRepository.findById.mockResolvedValue(null);

      await expect(foodService.getFoodById(id)).rejects.toThrow("Không tìm thấy món ăn");
    });
  });
});
