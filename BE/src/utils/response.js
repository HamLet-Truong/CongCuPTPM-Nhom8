// Hàm trả về response thành công theo đúng format trong API_SPEC.md.
const successResponse = (res, data, status = 200) => {
  return res.status(status).json({
    success: true,
    data,
  });
};

// Hàm trả về response lỗi theo đúng format trong API_SPEC.md.
const errorResponse = (res, message, status = 400) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
