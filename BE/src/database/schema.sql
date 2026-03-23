-- =========================
-- TẠO DATABASE
-- =========================
--CREATE DATABASE IF NOT EXISTS giao_do_an;
--USE giao_do_an;
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =========================
-- 1. NGƯỜI DÙNG
-- =========================
CREATE TABLE nguoi_dung (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    mat_khau VARCHAR(255) NOT NULL,
    ten VARCHAR(100) NOT NULL,
    so_dien_thoai VARCHAR(15) UNIQUE NOT NULL,
    vai_tro ENUM('USER', 'ADMIN') DEFAULT 'USER',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 2. NHÀ HÀNG
-- =========================
CREATE TABLE nha_hang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(15) UNIQUE NOT NULL,
    dia_chi TEXT NOT NULL,

    anh_quan VARCHAR(255) NOT NULL,
    giay_phep_kinh_doanh VARCHAR(255),
    anh_cccd VARCHAR(255) NOT NULL,
    anh_vstp VARCHAR(255),

    so_tai_khoan VARCHAR(50) NOT NULL,
    ten_ngan_hang VARCHAR(100) NOT NULL,

    trang_thai ENUM(
        'CHO_DUYET',
        'DA_DUYET',
        'TU_CHOI'
    ) DEFAULT 'CHO_DUYET',

    is_active BOOLEAN DEFAULT 1 COMMENT 'Bật tắt hoạt động nhận đơn',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 3. MÓN ĂN
-- =========================
CREATE TABLE mon_an (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten VARCHAR(255) NOT NULL,
    gia DECIMAL(10,2) NOT NULL CHECK (gia >= 0),
    nha_hang_id INT NOT NULL,

    FOREIGN KEY (nha_hang_id) REFERENCES nha_hang(id)
        ON DELETE CASCADE
);

-- =========================
-- 4. SHIPPER
-- =========================
CREATE TABLE shipper (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten VARCHAR(100) NOT NULL,
    so_dien_thoai VARCHAR(15) UNIQUE NOT NULL,

    anh_cccd VARCHAR(255) NOT NULL,
    anh_bang_lai VARCHAR(255) NOT NULL,
    anh_ca_vet_xe VARCHAR(255) NOT NULL,
    anh_bien_so_xe VARCHAR(255) NOT NULL,

    so_tai_khoan VARCHAR(50) NOT NULL,
    ten_ngan_hang VARCHAR(100) NOT NULL,

    trang_thai ENUM(
        'CHO_DUYET',
        'HOAT_DONG',
        'BI_KHOA'
    ) DEFAULT 'CHO_DUYET',

    is_active BOOLEAN DEFAULT 1 COMMENT 'Bật tắt hoạt động nhận đơn',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 5. ĐƠN HÀNG
-- =========================
CREATE TABLE don_hang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nguoi_dung_id INT NOT NULL,
    nha_hang_id INT NOT NULL,
    shipper_id INT NULL,

    tong_tien DECIMAL(12,2) NOT NULL CHECK (tong_tien >= 0),

    trang_thai ENUM(
        'DA_TAO',
        'NHA_HANG_XAC_NHAN',
        'DA_GAN_SHIPPER',
        'DANG_LAY_HANG',
        'DANG_GIAO',
        'HOAN_THANH',
        'DA_HUY'
    ) DEFAULT 'DA_TAO',

    phuong_thuc_thanh_toan ENUM(
        'TIEN_MAT',
        'VNPAY'
    ) NOT NULL,

    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id),
    FOREIGN KEY (nha_hang_id) REFERENCES nha_hang(id),
    FOREIGN KEY (shipper_id) REFERENCES shipper(id)
);

-- =========================
-- 6. CHI TIẾT ĐƠN HÀNG
-- =========================
CREATE TABLE chi_tiet_don_hang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    don_hang_id INT NOT NULL,
    mon_an_id INT NOT NULL,
    so_luong INT NOT NULL CHECK (so_luong > 0),
    gia DECIMAL(10,2) NOT NULL CHECK (gia >= 0),

    FOREIGN KEY (don_hang_id) REFERENCES don_hang(id)
        ON DELETE CASCADE,
    FOREIGN KEY (mon_an_id) REFERENCES mon_an(id)
);

-- =========================
-- 7. VOUCHER
-- =========================
CREATE TABLE voucher (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma VARCHAR(50) UNIQUE NOT NULL,
    giam_gia DECIMAL(10,2) NOT NULL CHECK (giam_gia >= 0),
    ngay_het_han DATETIME NOT NULL
);

-- =========================
-- 8. VÍ TIỀN
-- =========================
CREATE TABLE vi_tien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loai ENUM('USER', 'SHIPPER', 'NHA_HANG') NOT NULL,
    chu_so_huu_id INT NOT NULL,
    so_du DECIMAL(12,2) DEFAULT 0 CHECK (so_du >= 0)
);

-- =========================
-- 9. GIAO DỊCH
-- =========================
CREATE TABLE giao_dich (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loai_doi_tuong ENUM('USER', 'SHIPPER', 'NHA_HANG') NOT NULL,
    chu_so_huu_id INT NOT NULL,
    so_tien DECIMAL(12,2) NOT NULL,
    loai ENUM(
        'NAP_TIEN',
        'RUT_TIEN',
        'THANH_TOAN'
    ) NOT NULL,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 10. ĐÁNH GIÁ
-- =========================
CREATE TABLE danh_gia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nguoi_dung_id INT NOT NULL,
    nha_hang_id INT NOT NULL,
    diem INT CHECK (diem BETWEEN 1 AND 5),
    binh_luan TEXT,

    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id),
    FOREIGN KEY (nha_hang_id) REFERENCES nha_hang(id)
);

-- =========================
-- 11. THANH TOÁN
-- =========================
CREATE TABLE thanh_toan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    don_hang_id INT NOT NULL,
    so_tien DECIMAL(12,2) NOT NULL,

    trang_thai ENUM(
        'CHO_THANH_TOAN',
        'THANH_CONG',
        'THAT_BAI'
    ) DEFAULT 'CHO_THANH_TOAN',

    FOREIGN KEY (don_hang_id) REFERENCES don_hang(id)
        ON DELETE CASCADE
);

-- =========================
-- INDEX (TỐI ƯU QUERY)
-- =========================
CREATE INDEX idx_don_hang_nguoi_dung ON don_hang(nguoi_dung_id);
CREATE INDEX idx_don_hang_nha_hang ON don_hang(nha_hang_id);
CREATE INDEX idx_don_hang_shipper ON don_hang(shipper_id);