const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRE
});

const isStrongPassword = (password) => {
  if (password.length < 6) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  return true;
};

const PASSWORD_REQUIREMENTS =
  'Mật khẩu phải có ít nhất 6 ký tự, 1 chữ VIẾT HOA, 1 chữ số và 1 ký tự đặc biệt';

// Đăng ký
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email đã được sử dụng' });

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: PASSWORD_REQUIREMENTS });
    }

    const user = await User.create({ name, email, password, phone, address });
    res.status(201).json({
      success: true,
      data: {
        id: user.id, name: user.name, email: user.email,
        phone: user.phone, address: user.address,
        role: user.role, token: generateToken(user.id)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password, expectedRole } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu sai' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Email hoặc mật khẩu sai' });

    if (expectedRole && expectedRole !== user.role) {
      const roles = { CUSTOMER: 'Khách hàng', RECEPTIONIST: 'Nhân viên', ADMIN: 'Admin' };
      return res.status(403).json({
        message: `Tài khoản này không phải ${roles[expectedRole]}. Vui lòng đăng nhập đúng cổng.`
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id, name: user.name, email: user.email,
        phone: user.phone, address: user.address,
        role: user.role, token: generateToken(user.id)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin user
exports.getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// Cập nhật profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    await user.update({ name, phone, address });

    res.json({
      success: true,
      message: 'Cập nhật thành công',
      data: {
        id: user.id, name: user.name, email: user.email,
        phone: user.phone, address: user.address, role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ' });
    }
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: PASSWORD_REQUIREMENTS });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Quên mật khẩu
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Vui lòng nhập email' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Email không tồn tại' });

    const resetToken = jwt.sign(
      { id: user.id, purpose: 'reset-password' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      message: 'Xác thực thành công',
      data: { resetToken, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Thiếu thông tin' });
    }
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: PASSWORD_REQUIREMENTS });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Token không hợp lệ' });
    }

    if (decoded.purpose !== 'reset-password') {
      return res.status(400).json({ message: 'Token sai mục đích' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin tạo user
exports.createUserByAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Chỉ Admin mới có quyền' });
    }

    const { name, email, password, phone, address, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: PASSWORD_REQUIREMENTS });
    }

    const allowedRoles = ['CUSTOMER', 'RECEPTIONIST', 'ADMIN'];
    const finalRole = role || 'CUSTOMER';
    if (!allowedRoles.includes(finalRole)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email đã được sử dụng' });

    const user = await User.create({
      name, email, password, phone, address, role: finalRole
    });

    res.status(201).json({
      success: true,
      message: `Tạo tài khoản ${finalRole} thành công`,
      data: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin xem users
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

// Admin đổi role
exports.updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Chỉ Admin' });
    }

    const { role } = req.body;
    const allowedRoles = ['CUSTOMER', 'RECEPTIONIST', 'ADMIN'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Không thể đổi chính mình' });
    }

    await user.update({ role });
    res.json({ success: true, message: `Đã đổi thành ${role}`, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin xóa user
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Chỉ Admin' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Không thể xóa chính mình' });
    }

    await user.destroy();
    res.json({ success: true, message: 'Đã xóa user' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};