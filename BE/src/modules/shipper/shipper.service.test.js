const shipperService = require("./shipper.service");
const shipperRepository = require("./shipper.repository");

jest.mock("./shipper.repository");

describe("ShipperService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAvailableOrders", () => {
    it("should return available orders", async () => {
      const mockOrders = [
        { id: 1, trang_thai: "NHA_HANG_XAC_NHAN", shipper_id: null },
        { id: 2, trang_thai: "NHA_HANG_XAC_NHAN", shipper_id: null }
      ];
      shipperRepository.findAvailableOrders.mockResolvedValue(mockOrders);

      const result = await shipperService.getAvailableOrders();
      expect(result).toEqual(mockOrders);
      expect(shipperRepository.findAvailableOrders).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no available orders", async () => {
      shipperRepository.findAvailableOrders.mockResolvedValue([]);

      const result = await shipperService.getAvailableOrders();
      expect(result).toEqual([]);
    });
  });

  describe("getCurrentOrders", () => {
    it("should return current orders for shipper", async () => {
      const mockOrders = [
        { id: 1, shipper_id: 5, trang_thai: "DANG_GIAO" }
      ];
      shipperRepository.findCurrentOrders.mockResolvedValue(mockOrders);

      const result = await shipperService.getCurrentOrders(5);
      expect(result).toEqual(mockOrders);
      expect(shipperRepository.findCurrentOrders).toHaveBeenCalledWith(5);
    });

    it("should throw 400 if shipperId is missing", async () => {
      await expect(shipperService.getCurrentOrders(null))
        .rejects.toMatchObject({ status: 400 });
    });

    it("should return empty array when no current orders", async () => {
      shipperRepository.findCurrentOrders.mockResolvedValue([]);

      const result = await shipperService.getCurrentOrders(5);
      expect(result).toEqual([]);
    });
  });

  describe("getOrderHistory", () => {
    it("should return order history for shipper", async () => {
      const mockOrders = [
        { id: 1, shipper_id: 5, trang_thai: "HOAN_THANH" },
        { id: 2, shipper_id: 5, trang_thai: "DA_HUY" }
      ];
      shipperRepository.findOrderHistory.mockResolvedValue(mockOrders);

      const result = await shipperService.getOrderHistory(5);
      expect(result).toEqual(mockOrders);
      expect(shipperRepository.findOrderHistory).toHaveBeenCalledWith(5);
    });

    it("should throw 400 if shipperId is missing", async () => {
      await expect(shipperService.getOrderHistory(undefined))
        .rejects.toMatchObject({ status: 400 });
    });

    it("should return empty array when no history", async () => {
      shipperRepository.findOrderHistory.mockResolvedValue([]);

      const result = await shipperService.getOrderHistory(5);
      expect(result).toEqual([]);
    });
  });
});
