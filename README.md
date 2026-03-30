# 🍔 Food Delivery Backend (NodeJS + Express)

## 🚀 Giới thiệu

Backend hệ thống giao đồ ăn xây dựng bằng:

* NodeJS + Express
* MySQL
* Kiến trúc module (clean structure)

---

## 📦 Cấu trúc BE

```
src/
├── modules/        # Chia theo domain (user, order, ...)
├── database/       # schema.sql + connection
├── routes/         # gom route
├── app.js
└── server.js
```

---

## ⚙️ Yêu cầu môi trường

* NodeJS >= 18
* MySQL (Workbench hoặc XAMPP)
* npm hoặc yarn

---

## 🔧 Cài đặt project

### 1. Clone repo

```
git clone <repo-url>
```

---

### 2. Cài dependencies

```
npm install
```

---

### 3. Tạo file môi trường

```
cp .env.example .env
```

👉 sửa thông tin DB trong `.env`

---

### 4. Setup database

Tạo database:

```
CREATE DATABASE giao_do_an;
```

Import schema:

```
mysql -u root -p giao_do_an < src/database/schema.sql
```

---

### 5. Chạy project

```
npm run dev
```

---

## 🌐 API test

```
GET http://localhost:3000/
GET http://localhost:3000/api
```

---

## 📌 Quy tắc làm việc (Team Rules)

### 🔐 Database

* Không sửa DB trực tiếp
* Mọi thay đổi phải update `schema.sql`

---

### 🔀 Git

* Không push trực tiếp vào main
* Tạo branch riêng:

```
feature/user-api
feature/order-api
```

---

### 🧱 Code

* Không sửa module người khác
* Gọi module khác qua service

---

## 👥 Phân chia module

* User
* Auth
* Restaurant
* Menu
* Order
* Payment
* Delivery

---

## 🚀 Ghi chú

* DB local → sync qua `schema.sql`
* Sau này có thể nâng cấp Docker hoặc deploy

---

🔥 Happy coding team!
