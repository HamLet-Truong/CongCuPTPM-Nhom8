const VoucherService = require("./voucherService");
const voucherRepository = require("./voucherRepository");

jest.mock("./voucherRepository");

// Lấy instance singleton
const voucherService = require("./voucherService");

describe("VoucherService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllVouchers", () => {
    it("should return all vouchers", async () => {
      const mockVouchers = [
        { id: 1, ma: "SUMMER20", giam_gia: 50000, ngay_het_han: "2027-12-31" },
        { id: 2, ma: "XMAS50", giam_gia: 30000, ngay_het_han: "2027-12-25" }
      ];
      voucherRepository.findAll.mockResolvedValue(mockVouchers);

      const result = await voucherService.getAllVouchers();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockVouchers);
    });

    it("should return empty array when no vouchers", async () => {
      voucherRepository.findAll.mockResolvedValue([]);

      const result = await voucherService.getAllVouchers();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe("createVoucher", () => {
    it("should create voucher successfully", async () => {
      const data = { ma: "NEW50", giam_gia: 50000, ngay_het_han: "2027-12-31" };
      const created = { id: 1, ...data };

      voucherRepository.codeExists.mockResolvedValue(false);
      voucherRepository.createVoucher.mockResolvedValue(created);

      const result = await voucherService.createVoucher(data);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(created);
    });

    it("should throw error if voucher code already exists", async () => {
      const data = { ma: "EXISTING", giam_gia: 50000, ngay_het_han: "2027-12-31" };
      voucherRepository.codeExists.mockResolvedValue(true);

      await expect(voucherService.createVoucher(data)).rejects.toThrow("Mã voucher đã tồn tại");
    });

    it("should throw error if expiry date is in the past", async () => {
      const data = { ma: "OLD", giam_gia: 50000, ngay_het_han: "2020-01-01" };
      voucherRepository.codeExists.mockResolvedValue(false);

      await expect(voucherService.createVoucher(data)).rejects.toThrow("Ngày hết hạn phải lớn hơn ngày hiện tại");
    });
  });

  describe("validateVoucher", () => {
    it("should return voucher if valid", async () => {
      const voucher = { id: 1, ma: "VALID", giam_gia: 50000, ngay_het_han: new Date("2027-12-31") };
      voucherRepository.findByCode.mockResolvedValue(voucher);

      const result = await voucherService.validateVoucher("VALID");
      expect(result.success).toBe(true);
      expect(result.data).toEqual(voucher);
    });

    it("should throw error if voucher not found", async () => {
      voucherRepository.findByCode.mockResolvedValue(null);

      await expect(voucherService.validateVoucher("NOTEXIST")).rejects.toThrow("Mã voucher không tồn tại");
    });

    it("should throw error if voucher is expired", async () => {
      const voucher = { id: 1, ma: "EXPIRED", giam_gia: 50000, ngay_het_han: new Date("2020-01-01") };
      voucherRepository.findByCode.mockResolvedValue(voucher);

      await expect(voucherService.validateVoucher("EXPIRED")).rejects.toThrow("Voucher đã hết hạn");
    });
  });

  describe("getVoucherDetail", () => {
    it("should return voucher detail", async () => {
      const voucher = { id: 1, ma: "SUMMER20", giam_gia: 50000 };
      voucherRepository.findById.mockResolvedValue(voucher);

      const result = await voucherService.getVoucherDetail(1);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(voucher);
    });

    it("should throw error if voucher not found", async () => {
      voucherRepository.findById.mockResolvedValue(null);

      await expect(voucherService.getVoucherDetail(999)).rejects.toThrow("Voucher không tồn tại");
    });
  });

  describe("deleteVoucher", () => {
    it("should delete voucher successfully", async () => {
      const voucher = { id: 1, ma: "DEL" };
      voucherRepository.findById.mockResolvedValue(voucher);
      voucherRepository.deleteVoucher.mockResolvedValue(voucher);

      const result = await voucherService.deleteVoucher(1);
      expect(result.success).toBe(true);
    });

    it("should throw error if voucher not found", async () => {
      voucherRepository.findById.mockResolvedValue(null);

      await expect(voucherService.deleteVoucher(999)).rejects.toThrow("Voucher không tồn tại");
    });
  });
});
