const Joi = require('joi');


// ===== KIỂM TRA DỮ LIỆU VOUCHER =====
// Dùng thư viện Joi để kiểm tra dữ liệu đầu vào từ client

// Kiểm tra khi Admin tạo voucher mới
const createVoucherSchema = Joi.object({
    // Mã voucher (ví dụ: SUMMER20, XMAS50)
    ma: Joi.string()
        .alphanum()
        .min(3)
        .max(50)
        .required()
        .messages({
            'string.empty': 'Vui lòng nhập mã voucher',
            'string.alphanum': 'Mã voucher chỉ được chứa chữ và số',
            'string.min': 'Mã voucher phải có ít nhất 3 ký tự',
            'string.max': 'Mã voucher không được vượt quá 50 ký tự',
            'any.required': 'Mã voucher là bắt buộc'
        }),

    // Số tiền giảm giá (ví dụ: 50000)
    giam_gia: Joi.number()
        .positive()             // Giảm giá phải là số dương
        .required()             // Giảm giá là bắt buộc
        .messages({
            'number.base': 'Giảm giá phải là một con số',
            'number.positive': 'Giảm giá phải là một số dương',
            'any.required': 'Giảm giá là bắt buộc'
        }),

        // Ngày hết hạn (ví dụ: 2023-12-31)
    ngay_het_han: Joi.date()
        .iso()           // Ngày phải ở định dạng ISO (YYYY-MM-DD)
        .min('now')      // Ngày hết hạn phải lớn hơn ngày hiện tại
        .required()      // Ngày hết hạn là bắt buộc
        .messages({
            'date.base': 'Ngày hết hạn phải là một ngày hợp lệ',
            'date.min': 'Ngày hết hạn phải lớn hơn ngày hiện tại',
            'any.required': 'Ngày hết hạn là bắt buộc'
        })
});

// Kiểm tra khi khách hàng áp dụng voucher
const applyVoucherSchema = Joi.object({
    ma: Joi.string()
    .alphanum()
    .required()
    .messages({
        'string.empty': 'Vui lòng nhập mã voucher',
        'string.alphanum': 'Mã voucher chỉ được chứa chữ và số',
        'any.required': 'Mã voucher là bắt buộc'
    })
});

// Hàm kiểm tra dữ liệu khi Admin tạo voucher mới
const validateCreateVoucher = (data) => {
    return createVoucherSchema.validate(data, { abortEarly: false }); // Kiểm tra tất cả lỗi và trả về tất cả lỗi nếu có
};
 
// Hàm kiểm tra dữ liệu áp dụng voucher
const validateApplyVoucher = (data) => {
    return applyVoucherSchema.validate(data, { abortEarly: false }); // Kiểm tra tất cả lỗi và trả về tất cả lỗi nếu có
};


// Export các hàm kiểm tra để sử dụng trong service
module.exports = {
    validateCreateVoucher,
    validateApplyVoucher
};  

