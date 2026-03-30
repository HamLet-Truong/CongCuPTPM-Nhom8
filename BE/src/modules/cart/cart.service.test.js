const cartService = require("./cart.service");
const cartRepository = require("./cart.repository");

jest.mock("./cart.repository");

describe("CartService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCart", () => {
    it("should return cart items for user", async () => {
      const mockItems = [
        { id: 1, nguoi_dung_id: 1, mon_an_id: 10, so_luong: 2 },
        { id: 2, nguoi_dung_id: 1, mon_an_id: 20, so_luong: 1 }
      ];
      cartRepository.findByUserId.mockResolvedValue(mockItems);

      const result = await cartService.getCart(1);
      expect(result).toEqual(mockItems);
      expect(cartRepository.findByUserId).toHaveBeenCalledWith(1);
    });

    it("should return empty array when cart is empty", async () => {
      cartRepository.findByUserId.mockResolvedValue([]);

      const result = await cartService.getCart(1);
      expect(result).toEqual([]);
    });
  });

  describe("addToCart", () => {
    it("should add new item to cart", async () => {
      const data = { mon_an_id: 10, so_luong: 2 };
      const expected = { id: 1, nguoi_dung_id: 1, mon_an_id: 10, so_luong: 2 };

      cartRepository.findByUserAndFood.mockResolvedValue(null);
      cartRepository.create.mockResolvedValue(expected);

      const result = await cartService.addToCart(1, data);
      expect(result).toEqual(expected);
      expect(cartRepository.create).toHaveBeenCalledWith({
        nguoi_dung_id: 1,
        mon_an_id: 10,
        so_luong: 2
      });
    });

    it("should increase quantity if item already exists", async () => {
      const data = { mon_an_id: 10, so_luong: 3 };
      const existing = { id: 1, nguoi_dung_id: 1, mon_an_id: 10, so_luong: 2 };
      const updated = { ...existing, so_luong: 5 };

      cartRepository.findByUserAndFood.mockResolvedValue(existing);
      cartRepository.updateQuantity.mockResolvedValue(updated);

      const result = await cartService.addToCart(1, data);
      expect(result).toEqual(updated);
      expect(cartRepository.updateQuantity).toHaveBeenCalledWith(1, 5);
    });

    it("should default so_luong to 1 if not provided", async () => {
      const data = { mon_an_id: 10 };
      const expected = { id: 1, nguoi_dung_id: 1, mon_an_id: 10, so_luong: 1 };

      cartRepository.findByUserAndFood.mockResolvedValue(null);
      cartRepository.create.mockResolvedValue(expected);

      const result = await cartService.addToCart(1, data);
      expect(result).toEqual(expected);
      expect(cartRepository.create).toHaveBeenCalledWith({
        nguoi_dung_id: 1,
        mon_an_id: 10,
        so_luong: 1
      });
    });

    it("should throw error if mon_an_id is missing", async () => {
      await expect(cartService.addToCart(1, { so_luong: 2 })).rejects.toThrow();
    });

    it("should throw error if so_luong is negative", async () => {
      await expect(cartService.addToCart(1, { mon_an_id: 10, so_luong: -1 })).rejects.toThrow();
    });
  });

  describe("updateCartItem", () => {
    it("should update cart item quantity", async () => {
      const cartItem = { id: 1, nguoi_dung_id: 1, mon_an_id: 10, so_luong: 2 };
      const updated = { ...cartItem, so_luong: 5 };

      cartRepository.findById.mockResolvedValue(cartItem);
      cartRepository.updateQuantity.mockResolvedValue(updated);

      const result = await cartService.updateCartItem(1, 1, { so_luong: 5 });
      expect(result).toEqual(updated);
    });

    it("should throw 404 if cart item not found", async () => {
      cartRepository.findById.mockResolvedValue(null);

      await expect(cartService.updateCartItem(1, 999, { so_luong: 5 }))
        .rejects.toMatchObject({ status: 404 });
    });

    it("should throw 403 if user does not own cart item", async () => {
      const cartItem = { id: 1, nguoi_dung_id: 2, mon_an_id: 10, so_luong: 2 };
      cartRepository.findById.mockResolvedValue(cartItem);

      await expect(cartService.updateCartItem(1, 1, { so_luong: 5 }))
        .rejects.toMatchObject({ status: 403 });
    });

    it("should throw error if so_luong is missing", async () => {
      const cartItem = { id: 1, nguoi_dung_id: 1, mon_an_id: 10, so_luong: 2 };
      cartRepository.findById.mockResolvedValue(cartItem);

      await expect(cartService.updateCartItem(1, 1, {})).rejects.toThrow();
    });
  });

  describe("removeCartItem", () => {
    it("should delete cart item successfully", async () => {
      const cartItem = { id: 1, nguoi_dung_id: 1, mon_an_id: 10, so_luong: 2 };
      cartRepository.findById.mockResolvedValue(cartItem);
      cartRepository.delete.mockResolvedValue(cartItem);

      await cartService.removeCartItem(1, 1);
      expect(cartRepository.delete).toHaveBeenCalledWith(1);
    });

    it("should throw 404 if cart item not found", async () => {
      cartRepository.findById.mockResolvedValue(null);

      await expect(cartService.removeCartItem(1, 999))
        .rejects.toMatchObject({ status: 404 });
    });

    it("should throw 403 if user does not own cart item", async () => {
      const cartItem = { id: 1, nguoi_dung_id: 2, mon_an_id: 10, so_luong: 2 };
      cartRepository.findById.mockResolvedValue(cartItem);

      await expect(cartService.removeCartItem(1, 1))
        .rejects.toMatchObject({ status: 403 });
      expect(cartRepository.delete).not.toHaveBeenCalled();
    });
  });
});
