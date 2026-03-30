# Food Management API

## Yêu cầu
- Chỉ có **Restaurant Owner (NHA_HANG)** được phép CRUD (Create, Read, Update, Delete) món ăn
- Không được sửa/xóa món ăn của nhà hàng khác
- Public có thể xem (filter) danh sách món ăn

## Endpoints

### 1. Lấy danh sách món ăn (PUBLIC)
```
GET /v1/foods
```

**Query Parameters:**
- `nhaHangId` (optional) - Lọc theo ID nhà hàng

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ten": "Phở bò",
      "gia": 50000,
      "nha_hang_id": 1,
      "nha_hang": {
        "id": 1,
        "ten": "Nhà hàng Tươi Ngon"
      }
    }
  ]
}
```

**Ví dụ:**
```
GET http://localhost:3000/v1/foods?nhaHangId=1
```

---

### 2. Tạo món ăn (NHA_HANG)
```
POST /v1/foods
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Body:**
```json
{
  "ten": "Phở bò",
  "gia": 50000
}
```

**Validation:**
- `ten`: Bắt buộc, không được rỗng
- `gia`: Bắt buộc, phải lớn hơn 0

**Response (201):**
```json
{
  "success": true,
  "message": "Tạo món ăn thành công",
  "data": {
    "id": 1,
    "ten": "Phở bò",
    "gia": 50000,
    "nha_hang_id": 1
  }
}
```

**Error (400 - Invalid Data):**
```json
{
  "success": false,
  "message": "Tên món ăn là bắt buộc, Giá phải lớn hơn 0"
}
```

**Error (403 - Not Restaurant):**
```json
{
  "success": false,
  "message": "Bạn không có quyền thực hiện thao tác này"
}
```

---

### 3. Cập nhật món ăn (NHA_HANG + Owner)
```
PUT /v1/foods/{id}
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Body:**
```json
{
  "ten": "Phở bò Kho",
  "gia": 55000
}
```

**Validation:**
- Ít nhất một trường phải có (ten hoặc gia)
- `gia`: Phải lớn hơn 0 nếu cập nhật

**Response (200):**
```json
{
  "success": true,
  "message": "Cập nhật món ăn thành công",
  "data": {
    "id": 1,
    "ten": "Phở bò Kho",
    "gia": 55000,
    "nha_hang_id": 1
  }
}
```

**Error (404 - Not Found):**
```json
{
  "success": false,
  "message": "Không tìm thấy món ăn"
}
```

**Error (403 - Not Owner):**
```json
{
  "success": false,
  "message": "Bạn không có quyền sửa món ăn này"
}
```

---

### 4. Xóa món ăn (NHA_HANG + Owner)
```
DELETE /v1/foods/{id}
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Xóa món ăn thành công"
}
```

**Error (404 - Not Found):**
```json
{
  "success": false,
  "message": "Không tìm thấy món ăn"
}
```

**Error (403 - Not Owner):**
```json
{
  "success": false,
  "message": "Bạn không có quyền xóa món ăn này"
}
```

---

## Cấu trúc Code

### food.controller.js
- Xử lý request/response
- Lấy user info từ `req.user`
- Gọi service layer

### food.service.js
- **Validation** input bằng Joi
- **Business logic**
- **Ownership verification** (kiểm tra quyền sở hữu)
- Error handling với custom status codes

### food.repository.js
- Trực tiếp tương tác database qua Prisma
- CRUD operations

---

## Unit Tests

**Chạy tests:**
```bash
npm test
```

**Test Coverage:**
- ✅ Create: Valid input, missing fields, invalid price
- ✅ Read: All foods, filter by restaurant, food not found
- ✅ Update: Valid, ownership check, invalid input
- ✅ Delete: Valid, ownership check, food not found

---

## Lưu ý
1. **Ownership Validation**: Kiểm tra `nha_hang_id` trước khi update/delete
2. **JWT Authentication**: Routes có middleware `authenticate` + `authorize` bắt buộc NHA_HANG
3. **Data Types**: Gia sử dụng Decimal(10,2) trong database
4. **Middleware**: Food routes sử dụng auth middleware để kiểm tra token
