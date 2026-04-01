const crypto = require("crypto");

class VnpayConfig {
  constructor() {
    this.vnp_TmnCode = process.env.VNPAY_TMN_CODE || "YOUR_TMN_CODE";
    this.vnp_HashSecret = process.env.VNPAY_HASH_SECRET || "YOUR_HASH_SECRET";
    this.vnp_Url = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    this.vnp_ReturnUrl = process.env.VNPAY_RETURN_URL || "http://localhost:3000/api/v1/payments/vnpay-return";
    this.vnp_Api = process.env.VNPAY_API || "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
    
    this.locale = "vn";
    this.currency = "VND";
  }

  // Tạo checksum MD5
  md5(data) {
    return crypto.createHash("md5").update(data).digest("hex");
  }

  // Tạo checksum SHA512
  sha512(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  // Sort object theo key
  sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
      if (obj[key] !== null && obj[key] !== "" && obj[key] !== undefined) {
        sorted[key] = obj[key];
      }
    });
    return sorted;
  }

  // Tạo URL thanh toán VNPAY
  createPaymentUrl(orderId, amount, orderInfo, ipAddr) {
    const date = new Date();
    const createDate = formatDate(date);
    const expireDate = formatDate(new Date(date.getTime() + 15 * 60 * 1000)); // 15 phút

    const params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: this.vnp_TmnCode,
      vnp_Locale: this.locale,
      vnp_CurrCode: this.currency,
      vnp_TxnRef: orderId.toString(),
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: "order",
      vnp_Amount: Math.round(amount) * 100, // VNPAY yêu cầu * 100
      vnp_ReturnUrl: this.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate
    };

    // Sort và tạo query string
    const sortedParams = this.sortObject(params);
    const queryString = Object.keys(sortedParams)
      .map((key) => `${key}=${encodeURIComponent(sortedParams[key])}`)
      .join("&");

    // Tạo signature
    const signData = queryString;
    const signature = this.md5(signData + this.vnp_HashSecret);

    // Tạo URL đầy đủ
    const paymentUrl = `${this.vnp_Url}?${queryString}&vnp_SecureHash=${signature}`;

    return {
      paymentUrl,
      params: sortedParams,
      signature
    };
  }

  // Verify return URL
  verifyReturnUrl(params) {
    const {
      vnp_SecureHash,
      vnp_SecureHashType,
      ...inputData
    } = params;

    // Remove hash type, keep hash
    delete inputData.vnp_SecureHashType;

    // Sort và tạo signature để verify
    const sortedInput = this.sortObject(inputData);
    const queryString = Object.keys(sortedInput)
      .map((key) => `${key}=${encodeURIComponent(sortedInput[key])}`)
      .join("&");

    const signData = queryString + this.vnp_HashSecret;
    const signature = this.md5(signData);

    // So sánh signature
    const isValid = vnp_SecureHash === signature;

    return {
      isValid,
      inputData,
      calculatedSignature: signature
    };
  }
}

// Helper function format date
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

module.exports = new VnpayConfig();
