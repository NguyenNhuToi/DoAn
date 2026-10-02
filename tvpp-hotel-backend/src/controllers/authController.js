const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRE
});

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

exports.getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};