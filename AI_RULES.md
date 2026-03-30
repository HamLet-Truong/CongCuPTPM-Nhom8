# 🚀 AI CODING RULES

---

# 1. ARCHITECTURE

BẮT BUỘC:

Route → Controller → Service → Repository → Prisma

---

# 2. MODULE STRUCTURE

Each module must have:

- controller
- service
- repository
- routes

---

# 3. KHÔNG ĐƯỢC LÀM

- Không viết logic trong route
- Không query DB trong controller
- Không bỏ qua service layer
- Không gọi controller từ module khác

---

# 4. DATABASE

- Use Prisma ORM
- Do not use mysql2
- Use PrismaClient
- Use include for relations

---

# 5. TRANSACTION

Use Prisma transaction:

- create order
- create order items
- clear cart

Rollback nếu lỗi

---

# 6. AUTH

- Use JWT
- Middleware verify token
- Role-based access

---

# 7. VALIDATION

Luôn validate:

- required field
- data type
- business rule

---

# 8. RESPONSE FORMAT

Success:
{
  "success": true,
  "data": {}
}

Error:
{
  "success": false,
  "message": "error"
}

---

# 9. ORDER RULE

- Không skip trạng thái
- Phải đúng flow

---

# 10. ERROR HANDLING

- Use global error middleware
- Không trả raw error

---

# 11. NAMING

- DB: snake_case
- Code: camelCase

---

# 12. FINAL RULE

- Không thay đổi DB schema
- Không tự tạo logic ngoài spec
- Follow API_SPEC strictly