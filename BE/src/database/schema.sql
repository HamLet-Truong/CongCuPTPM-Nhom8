-- =========================
-- TẠO DATABASE
-- =========================
CREATE DATABASE IF NOT EXISTS giao_do_an CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE giao_do_an;

-- =========================
-- 1. NGUOI_DUNG
-- =========================
CREATE TABLE nguoi_dung (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    mat_khau VARCHAR(255) NOT NULL,
    ten VARCHAR(100) NOT NULL,
    so_dien_thoai VARCHAR(15) NOT NULL UNIQUE,
    vai_tro ENUM('USER','ADMIN') DEFAULT 'USER',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 2. DIA_CHI
-- =========================
CREATE TABLE dia_chi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nguoi_dung_id INT NOT NULL,
    dia_chi TEXT NOT NULL,
    mac_dinh BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
);

-- =========================
-- 3. NHA_HANG
-- =========================
CREATE TABLE nha_hang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(15) NOT NULL UNIQUE,
    dia_chi TEXT NOT NULL,

    anh_quan VARCHAR(255) NOT NULL,
    giay_phep_kinh_doanh VARCHAR(255),
    anh_cccd VARCHAR(255) NOT NULL,
    anh_vstp VARCHAR(255),

    so_tai_khoan VARCHAR(50) NOT NULL,
    ten_ngan_hang VARCHAR(100) NOT NULL,

    trang_thai ENUM('CHO_DUYET','DA_DUYET','TU_CHOI') DEFAULT 'CHO_DUYET',
    is_active BOOLEAN DEFAULT 1,

    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 4. MON_AN
-- =========================
CREATE TABLE mon_an (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten VARCHAR(255) NOT NULL,
    gia DECIMAL(10,2) NOT NULL,
    nha_hang_id INT NOT NULL,

    CHECK (gia >= 0),

    FOREIGN KEY (nha_hang_id) REFERENCES nha_hang(id) ON DELETE CASCADE
);

-- =========================
-- 5. SHIPPER
-- =========================
CREATE TABLE shipper (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten VARCHAR(100) NOT NULL,
    so_dien_thoai VARCHAR(15) NOT NULL UNIQUE,

    anh_cccd VARCHAR(255) NOT NULL,
    anh_bang_lai VARCHAR(255) NOT NULL,
    anh_ca_vet_xe VARCHAR(255) NOT NULL,
    anh_bien_so_xe VARCHAR(255) NOT NULL,

    so_tai_khoan VARCHAR(50) NOT NULL,
    ten_ngan_hang VARCHAR(100) NOT NULL,

    trang_thai ENUM('CHO_DUYET','HOAT_DONG','BI_KHOA') DEFAULT 'CHO_DUYET',
    is_active BOOLEAN DEFAULT 1,

    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 6. GIO_HANG
-- =========================
CREATE TABLE gio_hang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nguoi_dung_id INT NOT NULL,
    mon_an_id INT NOT NULL,
    so_luong INT NOT NULL,

    CHECK (so_luong > 0),
    UNIQUE (nguoi_dung_id, mon_an_id),

    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    FOREIGN KEY (mon_an_id) REFERENCES mon_an(id)
);

-- =========================
-- 7. VOUCHER
-- =========================
CREATE TABLE voucher (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma VARCHAR(50) NOT NULL UNIQUE,
    giam_gia DECIMAL(10,2) NOT NULL,
    ngay_het_han DATETIME NOT NULL,

    CHECK (giam_gia >= 0)
);

-- =========================
-- 8. DON_HANG
-- =========================
CREATE TABLE don_hang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nguoi_dung_id INT NOT NULL,
    nha_hang_id INT NOT NULL,
    shipper_id INT NULL,
    dia_chi_id INT NOT NULL,
    voucher_id INT NULL,

    tong_tien DECIMAL(12,2) NOT NULL,
    phuong_thuc_thanh_toan ENUM('TIEN_MAT','VNPAY') NOT NULL,

    trang_thai ENUM(
        'DA_TAO',
        'NHA_HANG_XAC_NHAN',
        'DA_GAN_SHIPPER',
        'DANG_LAY_HANG',
        'DANG_GIAO',
        'HOAN_THANH',
        'DA_HUY'
    ) DEFAULT 'DA_TAO',

    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CHECK (tong_tien >= 0),

    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id),
    FOREIGN KEY (nha_hang_id) REFERENCES nha_hang(id),
    FOREIGN KEY (shipper_id) REFERENCES shipper(id),
    FOREIGN KEY (dia_chi_id) REFERENCES dia_chi(id),
    FOREIGN KEY (voucher_id) REFERENCES voucher(id)
);

-- =========================
-- 9. CHI_TIET_DON_HANG
-- =========================
CREATE TABLE chi_tiet_don_hang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    don_hang_id INT NOT NULL,
    mon_an_id INT NOT NULL,
    so_luong INT NOT NULL,
    gia DECIMAL(10,2) NOT NULL,

    CHECK (so_luong > 0),
    CHECK (gia >= 0),

    FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE CASCADE,
    FOREIGN KEY (mon_an_id) REFERENCES mon_an(id)
);

-- =========================
-- 10. THANH_TOAN
-- =========================
CREATE TABLE thanh_toan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    don_hang_id INT NOT NULL,
    so_tien DECIMAL(12,2) NOT NULL,

    trang_thai ENUM('CHO_THANH_TOAN','THANH_CONG','THAT_BAI') DEFAULT 'CHO_THANH_TOAN',

    FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE CASCADE
);

-- =========================
-- 11. VI_TIEN
-- =========================
CREATE TABLE vi_tien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loai ENUM('USER','SHIPPER','NHA_HANG') NOT NULL,
    chu_so_huu_id INT NOT NULL,
    so_du DECIMAL(12,2) DEFAULT 0,

    CHECK (so_du >= 0)
);

-- =========================
-- 12. GIAO_DICH
-- =========================
CREATE TABLE giao_dich (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loai_doi_tuong ENUM('USER','SHIPPER','NHA_HANG') NOT NULL,
    chu_so_huu_id INT NOT NULL,
    so_tien DECIMAL(12,2) NOT NULL,
    loai ENUM('NAP_TIEN','RUT_TIEN','THANH_TOAN') NOT NULL,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 13. DANH_GIA
-- =========================
CREATE TABLE danh_gia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nguoi_dung_id INT NOT NULL,
    nha_hang_id INT NOT NULL,
    don_hang_id INT NOT NULL,

    diem INT NOT NULL,
    binh_luan TEXT,

    CHECK (diem BETWEEN 1 AND 5),

    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id),
    FOREIGN KEY (nha_hang_id) REFERENCES nha_hang(id),
    FOREIGN KEY (don_hang_id) REFERENCES don_hang(id)
);

-- =========================
-- INDEX (TĂNG TỐC)
-- =========================
CREATE INDEX idx_don_hang_user ON don_hang(nguoi_dung_id);
CREATE INDEX idx_don_hang_shipper ON don_hang(shipper_id);
CREATE INDEX idx_mon_an_nha_hang ON mon_an(nha_hang_id);