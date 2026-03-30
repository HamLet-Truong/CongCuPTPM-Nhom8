# Food API - Quick Reference

## 🚀 Fast Track

### Login & Get Token
```bash
# 1. Register Restaurant
POST /v1/auth/register-restaurant
{
  "ten_tai_khoan": "rest1",
  "mat_khau": "pass123",
  "email": "rest@example.com",
  "ten_nha_hang": "Nhà hàng",
  "dia_chi": "123 Đường"
}

# 2. Login
POST /v1/auth/login
{
  "ten_tai_khoan": "rest1",
  "mat_khau": "pass123"
}
# Response: { token: "jwt_token_here" }
```

### CRUD Operations
```bash
# Create
POST /v1/foods
Header: "Authorization: Bearer TOKEN"
{ "ten": "Phở", "gia": 50000 }

# Read All
GET /v1/foods
GET /v1/foods?nhaHangId=1

# Read One
GET /v1/foods/1

# Update (Owner only)
PUT /v1/foods/1
Header: "Authorization: Bearer TOKEN"
{ "ten": "Phở Kho", "gia": 55000 }

# Delete (Owner only)
DELETE /v1/foods/1
Header: "Authorization: Bearer TOKEN"
```

---

## ✅ Checklist

- [x] CRUD Food
- [x] Filter by Restaurant
- [x] Validate Ownership
- [x] Input Validation (Joi)
- [x] Unit Tests (17+)
- [x] Error Handling
- [x] Documentation
- [x] Postman Guide

---

## 📝 Validation

| Field | Required | Validation |
|-------|----------|------------|
| `ten` | ✅ Yes | Not empty string |
| `gia` | ✅ Yes | Number > 0 |

## 🔐 Permissions

| Action | Auth | Role | Owner Check |
|--------|------|------|-------------|
| GET /foods | ❌ | Any | ❌ |
| POST /foods | ✅ | NHA_HANG | ❌ |
| PUT /foods/:id | ✅ | NHA_HANG | ✅ |
| DELETE /foods/:id | ✅ | NHA_HANG | ✅ |

---

## 🧪 Test
```bash
npm test                    # Run all tests
npm test -- --coverage      # With coverage
```

---

## 📂 Files Modified/Created

**Service Layer:**
- ✏️ food.service.js - Added Joi validation

**Tests:**
- ✏️ food.service.test.js - Enhanced (17+ tests)

**Documentation:**
- ✨ FOOD_API.md - API specifications
- ✨ POSTMAN_TEST_GUIDE.md - Testing guide
- ✨ COMPLETION_REPORT.md - Full report
- ✨ QUICK_REFERENCE.md - This file

---

## 🔍 Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 201 | OK | Success (Create) |
| 200 | OK | Success |
| 400 | Bad Request | Invalid input |
| 403 | Forbidden | Not owner / Not NHA_HANG |
| 404 | Not Found | Food not found |
| 401 | Unauthorized | Invalid token |

---

## 💡 Tips

1. **Copy token after login** and use `Authorization: Bearer {token}` for protected routes
2. **Test validation** by sending invalid data (empty string, negative price)
3. **Test ownership** by trying to update/delete another's food
4. **Public endpoint** is GET /v1/foods - no auth needed
5. **Use Postman environment variables** to store token and IDs

---

## 🎯 Next Steps (Optional)

- [ ] Add pagination (limit, offset)
- [ ] Add sorting (by price, name)
- [ ] Add soft delete (status field)
- [ ] Add description field
- [ ] Add image URL
- [ ] Add category field
- [ ] Add availability status
- [ ] Add dietary tags (vegan, spicy, etc.)

