# 🚀 API SPEC - FOOD DELIVERY

Base URL: /api/v1  
Auth: Authorization: Bearer <token>

---

# RESPONSE FORMAT

Success:
{
  "success": true,
  "data": {}
}

Error:
{
  "success": false,
  "message": "error message"
}

---

# AUTH

## POST /auth/register
Role: PUBLIC

Request:
{
  "email": "string",
  "password": "string >= 6",
  "ten": "string",
  "so_dien_thoai": "string"
}

---

## POST /auth/login
Role: PUBLIC

Request:
{
  "email": "string",
  "password": "string"
}

Response:
{
  "token": "string"
}

---

# ADDRESS

## POST /addresses
Role: USER

Request:
{
  "dia_chi": "string",
  "mac_dinh": true
}

---

# ORDER

## POST /orders
Role: USER

Request:
{
  "restaurantId": number,
  "dia_chi_id": number,
  "items": [
    { "foodId": number, "quantity": number }
  ],
  "voucherCode": "string",
  "paymentMethod": "TIEN_MAT | VNPAY"
}

Response:
{
  "id": number,
  "tong_tien": number,
  "trang_thai": "DA_TAO"
}

---

## PUT /orders/:id/cancel
Role: USER

---

## PUT /orders/:id/restaurant-confirm
Role: RESTAURANT

---

## POST /shipper/orders/:id/accept
Role: SHIPPER

---

# PAYMENT

## POST /payments/vnpay
Role: USER

Request:
{
  "orderId": number
}

Response:
{
  "url": "string"
}

---

# REVIEW

## POST /reviews
Role: USER

Request:
{
  "orderId": number,
  "diem": number,
  "binh_luan": "string"
}