const { Room } = require('../models');
const { Op } = require('sequelize');

exports.getRooms = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, status } = req.query;
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }
    const rooms = await Room.findAll({ where, order: [['id', 'ASC']] });
    res.json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });
    await room.update(req.body);
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });
    await room.destroy();
    res.json({ success: true, message: 'Đã xóa phòng' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};