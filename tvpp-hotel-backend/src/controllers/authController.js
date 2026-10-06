const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRE
});

// ========== ĐĂNG KÝ ==========
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email đã được sử dụng' });

    const user = await User.create({ name, email, password, phone, address });
    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        token: generateToken(user.id)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== ĐĂNG NHẬP (HỖ TRỢ PHÂN VAI TRÒ) ==========
exports.login = async (req, res) => {
  try {
    const { email, password, expectedRole } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu sai' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Email hoặc mật khẩu sai' });

    if (expectedRole) {
      if (expectedRole === 'CUSTOMER' && user.role !== 'CUSTOMER') {
        return res.status(403).json({
          message: 'Tài khoản này không phải Khách hàng. Vui lòng đăng nhập đúng cổng.'
        });
      }
      if (expectedRole === 'RECEPTIONIST' && user.role !== 'RECEPTIONIST') {
        return res.status(403).json({
          message: 'Tài khoản này không phải Nhân viên. Vui lòng đăng nhập đúng cổng.'
        });
      }
      if (expectedRole === 'ADMIN' && user.role !== 'ADMIN') {
        return res.status(403).json({
          message: 'Tài khoản này không phải Admin. Vui lòng đăng nhập đúng cổng.'
        });
      }
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        token: generateToken(user.id)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== LẤY THÔNG TIN USER HIỆN TẠI ==========
exports.getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// ========== CẬP NHẬT THÔNG TIN CÁ NHÂN ==========
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    await user.update({ name, phone, address });

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== ĐỔI MẬT KHẨU ==========
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải từ 6 ký tự' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== QUÊN MẬT KHẨU — Bước 1 ==========
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Vui lòng nhập email' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });

    const resetToken = jwt.sign(
      { id: user.id, purpose: 'reset-password' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      message: 'Xác thực email thành công. Vui lòng đặt lại mật khẩu.',
      data: {
        resetToken,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== ĐẶT LẠI MẬT KHẨU — Bước 2 ==========
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Thiếu thông tin' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải từ 6 ký tự' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    if (decoded.purpose !== 'reset-password') {
      return res.status(400).json({ message: 'Token không đúng mục đích' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== 🆕 ADMIN — TẠO TÀI KHOẢN NHÂN VIÊN/ADMIN ==========
exports.createUserByAdmin = async (req, res) => {
  try {
    // Chỉ ADMIN mới được tạo (double-check middleware)
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Chỉ Admin mới có quyền tạo tài khoản' });
    }

    const { name, email, password, phone, address, role } = req.body;

    // Validate
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ Tên, Email và Mật khẩu' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải từ 6 ký tự' });
    }

    // Chỉ cho tạo 3 role hợp lệ
    const allowedRoles = ['CUSTOMER', 'RECEPTIONIST', 'ADMIN'];
    const finalRole = role || 'CUSTOMER';
    if (!allowedRoles.includes(finalRole)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    // Kiểm tra email trùng
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email đã được sử dụng' });

    const user = await User.create({
      name, email, password, phone, address,
      role: finalRole
    });

    res.status(201).json({
      success: true,
      message: `Tạo tài khoản ${finalRole} thành công`,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== 🆕 ADMIN — LẤY DANH SÁCH USER ==========
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Chỉ Admin mới có quyền' });
    }

    const { role } = req.query;
    const where = {};
    if (role) where.role = role;

    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'phone', 'address', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== 🆕 ADMIN — ĐỔI ROLE USER ==========
exports.updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Chỉ Admin mới có quyền' });
    }

    const { role } = req.body;
    const allowedRoles = ['CUSTOMER', 'RECEPTIONIST', 'ADMIN'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    // Không cho admin tự đổi role của mình → tránh tự hạ quyền
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Không thể đổi vai trò của chính mình' });
    }

    await user.update({ role });

    res.json({
      success: true,
      message: `Đã đổi vai trò thành ${role}`,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== 🆕 ADMIN — XÓA USER ==========
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Chỉ Admin mới có quyền' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    // Không cho xóa chính mình
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Không thể xóa chính mình' });
    }

    await user.destroy();
    res.json({ success: true, message: 'Đã xóa user' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};