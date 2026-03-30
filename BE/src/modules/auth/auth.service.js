const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authRepository = require("./auth.repository");
const nhaHangRepository = require("./nha_hang.repository");
const shipperRepository = require("./shipper.repository");

class AuthService {
  // ===================== NGUOI DUNG =====================

  async register(data) {
    if (!data.email || !data.password || !data.ten) {
      const error = new Error("Vui lòng điền đầy đủ thông tin bắt buộc: email, password, ten");
      error.status = 400;
      throw error;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      const error = new Error("Email không hợp lệ");
      error.status = 400;
      throw error;
    }

    if (data.password.length < 6) {
      const error = new Error("Mật khẩu phải có ít nhất 6 ký tự");
      error.status = 400;
      throw error;
    }

    const existingEmail = await authRepository.findByEmail(data.email);
    if (existingEmail) {
      const error = new Error("Email đã được sử dụng");
      error.status = 409;
      throw error;
    }

    if (data.so_dien_thoai) {
      const existingPhone = await authRepository.findBySoDienThoai(data.so_dien_thoai);
      if (existingPhone) {
        const error = new Error("Số điện thoại đã được sử dụng");
        error.status = 409;
        throw error;
      }
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const createData = {
      email: data.email,
      matKhau: hashedPassword,
      ten: data.ten,
      vaiTro: "USER"
    };

    if (data.so_dien_thoai) {
      createData.soDienThoai = data.so_dien_thoai;
    }

    const newUser = await authRepository.create(createData);

    const { mat_khau, ...userWithoutPassword } = newUser;

    const token = jwt.sign(
      {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        vai_tro: userWithoutPassword.vai_tro,
        loai_tai_khoan: "USER"
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return {
      user: userWithoutPassword,
      token
    };
  }

  async login(data) {
    if (!data.email || !data.password) {
      const error = new Error("Vui lòng nhập email và mật khẩu");
      error.status = 400;
      throw error;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      const error = new Error("Email không hợp lệ");
      error.status = 400;
      throw error;
    }

    const user = await authRepository.findByEmail(data.email);
    if (!user) {
      const error = new Error("Email hoặc mật khẩu không đúng");
      error.status = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.mat_khau);
    if (!isPasswordValid) {
      const error = new Error("Email hoặc mật khẩu không đúng");
      error.status = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        vai_tro: user.vai_tro,
        loai_tai_khoan: "USER"
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        ten: user.ten,
        vai_tro: user.vai_tro
      }
    };
  }

  async getCurrentUser(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      const error = new Error("Không tìm thấy người dùng");
      error.status = 404;
      throw error;
    }

    const { mat_khau, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, loai_tai_khoan: "USER" };
  }

  async getMe(loai_tai_khoan, id) {
    switch (loai_tai_khoan) {
      case "USER":
        return await this.getCurrentUser(id);
      case "NHA_HANG":
        return await this.getNhaHangById(id);
      case "SHIPPER":
        return await this.getShipperById(id);
      default:
        const error = new Error("Loại tài khoản không hợp lệ");
        error.status = 400;
        throw error;
    }
  }

  async getNhaHangById(id) {
    const restaurant = await nhaHangRepository.findById(id);
    if (!restaurant) {
      const error = new Error("Không tìm thấy nhà hàng");
      error.status = 404;
      throw error;
    }
    return { ...restaurant, loai_tai_khoan: "NHA_HANG" };
  }

  async getShipperById(id) {
    const shipper = await shipperRepository.findById(id);
    if (!shipper) {
      const error = new Error("Không tìm thấy shipper");
      error.status = 404;
      throw error;
    }
    return { ...shipper, loai_tai_khoan: "SHIPPER" };
  }

  // ===================== NHA HANG =====================

  async registerRestaurant(data) {
    const requiredFields = ["ten", "so_dien_thoai", "dia_chi", "anh_quan", "anh_cccd", "so_tai_khoan", "ten_ngan_hang"];

    for (const field of requiredFields) {
      if (!data[field]) {
        const error = new Error(`Vui lòng điền đầy đủ thông tin bắt buộc: ${requiredFields.join(", ")}`);
        error.status = 400;
        throw error;
      }
    }

    if (data.so_dien_thoai) {
      const existingPhone = await nhaHangRepository.findBySoDienThoai(data.so_dien_thoai);
      if (existingPhone) {
        const error = new Error("Số điện thoại đã được sử dụng bởi nhà hàng khác");
        error.status = 409;
        throw error;
      }
    }

    const newRestaurant = await nhaHangRepository.create({
      ten: data.ten,
      soDienThoai: data.so_dien_thoai,
      diaChi: data.dia_chi,
      anhQuan: data.anh_quan,
      giayPhepKinhDoanh: data.giay_phep_kinh_doanh,
      anhCccd: data.anh_cccd,
      anhVstp: data.anh_vstp,
      soTaiKhoan: data.so_tai_khoan,
      tenNganHang: data.ten_ngan_hang
    });

    return {
      restaurant: newRestaurant
    };
  }

  // ===================== SHIPPER =====================

  async registerShipper(data) {
    const requiredFields = ["ten", "so_dien_thoai", "anh_cccd", "anh_bang_lai", "anh_ca_vet_xe", "anh_bien_so_xe", "so_tai_khoan", "ten_ngan_hang"];

    for (const field of requiredFields) {
      if (!data[field]) {
        const error = new Error(`Vui lòng điền đầy đủ thông tin bắt buộc: ${requiredFields.join(", ")}`);
        error.status = 400;
        throw error;
      }
    }

    if (data.so_dien_thoai) {
      const existingPhone = await shipperRepository.findBySoDienThoai(data.so_dien_thoai);
      if (existingPhone) {
        const error = new Error("Số điện thoại đã được sử dụng bởi shipper khác");
        error.status = 409;
        throw error;
      }
    }

    const newShipper = await shipperRepository.create({
      ten: data.ten,
      soDienThoai: data.so_dien_thoai,
      anhCccd: data.anh_cccd,
      anhBangLai: data.anh_bang_lai,
      anhCaVetXe: data.anh_ca_vet_xe,
      anhBienSoXe: data.anh_bien_so_xe,
      soTaiKhoan: data.so_tai_khoan,
      tenNganHang: data.ten_ngan_hang
    });

    return {
      shipper: newShipper
    };
  }
}

module.exports = new AuthService();
