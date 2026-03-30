# Food API - Postman Testing Guide

## Bước 1: Setup Postman Environment

### Tạo Environment Variable
1. Mở Postman → **Environments** (ngoài cùng bên trái)
2. Nhấn **Create Environment** → Tên: `CongCuPTPM-Dev`
3. Thêm variables:
   ```
   base_url = http://localhost:3000
   token = (sẽ lấy sau khi login)
   restaurant_token = (token của nhà hàng)
   restaurant_id = (ID của nhà hàng)
   ```
4. Nhấn **Save**

---

## Bước 2: Test Các Endpoints

### 2.1 Health Check
```
GET {{base_url}}/health
```
✅ **Response (200):**
```json
{
  "message": "API endpoints are working"
}
```

---

### 2.2 Đăng ký & Đăng nhập Nhà Hàng

#### Đăng ký Nhà Hàng
```
POST {{base_url}}/v1/auth/register-restaurant
```

**Body (raw JSON):**
```json
{
  "ten_tai_khoan": "nha_hang_tuoi_ngon",
  "mat_khau": "password123",
  "email": "restaurant@example.com",
  "ten_nha_hang": "Nhà hàng Tươi Ngon",
  "dia_chi": "123 Đường ABC, Quận 1, TP.HCM"
}
```

✅ **Response (201):**
```json
{
  "success": true,
  "message": "Đăng ký nhà hàng thành công",
  "data": {
    "id": 1,
    "ten": "Nhà hàng Tươi Ngon",
    "email": "restaurant@example.com"
  }
}
```

#### Đăng nhập Nhà Hàng
```
POST {{base_url}}/v1/auth/login
```

**Body (raw JSON):**
```json
{
  "ten_tai_khoan": "nha_hang_tuoi_ngon",
  "mat_khau": "password123"
}
```

✅ **Response (200):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": 1,
      "ten_tai_khoan": "nha_hang_tuoi_ngon",
      "loai_tai_khoan": "NHA_HANG"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
}
```

⚠️ **Copy `token` để dùng cho các request tiếp theo**

---

### 2.3 Quản lý Món Ăn

#### A. Lấy danh sách tất cả món ăn (PUBLIC)
```
GET {{base_url}}/v1/foods
```

✅ **Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ten": "Phở bò",
      "gia": "50000.00",
      "nha_hang_id": 1,
      "nha_hang": {
        "id": 1,
        "ten": "Nhà hàng Tươi Ngon"
      }
    }
  ]
}
```

#### B. Lọc món ăn theo nhà hàng
```
GET {{base_url}}/v1/foods?nhaHangId=1
```

---

#### C. Tạo món ăn (chỉ NHA_HANG)
```
POST {{base_url}}/v1/foods
```

**Headers:**
```
Authorization: Bearer {{restaurant_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "ten": "Phở bò",
  "gia": 50000
}
```

✅ **Response (201):**
```json
{
  "success": true,
  "message": "Tạo món ăn thành công",
  "data": {
    "id": 1,
    "ten": "Phở bò",
    "gia": "50000.00",
    "nha_hang_id": 1
  }
}
```

❌ **Error - Missing field (400):**
```json
{
  "success": false,
  "message": "Tên món ăn là bắt buộc"
}
```

❌ **Error - Invalid price (400):**
```json
{
  "success": false,
  "message": "Giá phải lớn hơn 0"
}
```

---

#### D. Cập nhật món ăn
```
PUT {{base_url}}/v1/foods/1
```

**Headers:**
```
Authorization: Bearer {{restaurant_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "ten": "Phở bò Kho",
  "gia": 55000
}
```

✅ **Response (200):**
```json
{
  "success": true,
  "message": "Cập nhật món ăn thành công",
  "data": {
    "id": 1,
    "ten": "Phở bò Kho",
    "gia": "55000.00",
    "nha_hang_id": 1
  }
}
```

❌ **Error - Food not found (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy món ăn"
}
```

❌ **Error - Not owner (403):**
```json
{
  "success": false,
  "message": "Bạn không có quyền sửa món ăn này"
}
```

---

#### E. Xóa món ăn
```
DELETE {{base_url}}/v1/foods/1
```

**Headers:**
```
Authorization: Bearer {{restaurant_token}}
```

✅ **Response (200):**
```json
{
  "success": true,
  "message": "Xóa món ăn thành công"
}
```

---

## Test Script Tips

### 1. Tự động lưu token sau khi login
Vào tab **Tests** của request login:
```javascript
if (pm.response.code === 200) {
  let jsonData = pm.response.json();
  pm.environment.set("restaurant_token", jsonData.data.token);
  pm.environment.set("restaurant_id", jsonData.data.user.id);
}
```

### 2. Tự động lưu food ID sau khi create
Vào tab **Tests** của request create food:
```javascript
if (pm.response.code === 201) {
  let jsonData = pm.response.json();
  pm.environment.set("food_id", jsonData.data.id);
}
```

### 3. Pre-request Script để validate
```javascript
if (!pm.environment.get("restaurant_token")) {
  pm.warn("Vui lòng login trước!");
}
```

---

## Kịch bản Test Đầy đủ

1. ✅ Health Check
2. ✅ Register Restaurant
3. ✅ Login Restaurant → Copy token
4. ✅ Create Food #1
5. ✅ Create Food #2
6. ✅ Get All Foods
7. ✅ Filter Foods by Restaurant
8. ✅ Update Food #1
9. ✅ Delete Food #1
10. ✅ Get All Foods (verify deleted)

---

## Lưu ý quan trọng

✅ **Luôn gửi `Authorization: Bearer {token}` cho requests protected**
✅ **Content-Type: application/json**
✅ **Gia phải > 0 và là số**
✅ **Tên món ăn không được rỗng**
✅ **Chỉ Restaurant owner mới được update/delete món của mình**
