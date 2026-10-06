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
        id: user.id, name: user.name, email: user.email,
        role: user.role, token: generateToken(user.id)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== ĐĂNG NHẬP ==========
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu sai' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Email hoặc mật khẩu sai' });

    res.json({
      success: true,
      data: {
        id: user.id, name: user.name, email: user.email,
        role: user.role, token: generateToken(user.id)
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

// ========== 🆕 CẬP NHẬT THÔNG TIN CÁ NHÂN ==========
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

// ========== 🆕 ĐỔI MẬT KHẨU ==========
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Kiểm tra input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải từ 6 ký tự' });
    }

    // Tìm user
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    // Kiểm tra mật khẩu cũ
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
    }

    // Cập nhật mật khẩu mới (hook beforeUpdate sẽ tự hash)
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