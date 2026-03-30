# 🚀 FOOD DELIVERY SYSTEM - PROJECT SPEC

---

# 1. OVERVIEW

Hệ thống giao đồ ăn gồm 4 role:

- USER: đặt món
- RESTAURANT: quản lý menu, xử lý đơn
- SHIPPER: giao hàng
- ADMIN: quản lý hệ thống

---

# 2. MAIN FLOW

1. User login
2. Xem nhà hàng
3. Xem menu
4. Thêm vào giỏ hàng
5. Tạo đơn hàng
6. Nhà hàng xác nhận
7. Shipper nhận đơn
8. Giao hàng
9. Hoàn thành
10. Đánh giá

---

# 3. ORDER FLOW (STATE MACHINE)

DA_TAO
→ NHA_HANG_XAC_NHAN
→ DA_GAN_SHIPPER
→ DANG_LAY_HANG
→ DANG_GIAO
→ HOAN_THANH
→ DA_HUY

---

# 4. ORDER TRANSITION

DA_TAO → NHA_HANG_XAC_NHAN  
- by: RESTAURANT  

NHA_HANG_XAC_NHAN → DA_GAN_SHIPPER  
- by: SHIPPER  

DA_GAN_SHIPPER → DANG_LAY_HANG  
- by: SHIPPER  

DANG_LAY_HANG → DANG_GIAO  
- by: SHIPPER  

DANG_GIAO → HOAN_THANH  
- by: SHIPPER  

CANCEL:
- Only allowed when: DA_TAO, NHA_HANG_XAC_NHAN

---

# 5. ROLE PERMISSION

USER:
- create order
- view own orders
- review

RESTAURANT:
- confirm order
- manage food

SHIPPER:
- accept order
- update delivery status

ADMIN:
- approve restaurant
- manage voucher
- manage wallet

---

# 6. BUSINESS RULE

## ORDER
- Không được skip trạng thái
- Không assign nhiều shipper

## REVIEW
- Chỉ khi HOAN_THANH

## PAYMENT
- VNPAY phải thành công
- COD được phép

---

# 7. TRANSACTION

Create order:
- create don_hang
- create chi_tiet_don_hang
- clear cart

→ rollback nếu lỗi

---

# 8. MODULE

- auth
- user
- restaurant
- food
- cart
- order
- shipper
- payment
- voucher
- review
- wallet

---

# 9. DATABASE RELATION

- nguoi_dung 1 - n don_hang
- don_hang 1 - n chi_tiet_don_hang
- mon_an n - 1 nha_hang
- nguoi_dung 1 - n dia_chi

---

# 10. VALIDATION

- email đúng format
- password >= 6
- quantity > 0
- order phải có item

---

# 11. ERROR CASE

- restaurant từ chối đơn
- shipper không nhận
- payment fail → cancel order

---

# 12. GOAL

- Clean architecture
- Dễ mở rộng
- Không bug logic