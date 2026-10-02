const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Room', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  roomNumber: {
    type: DataTypes.STRING(10), allowNull: false, unique: true,
    field: 'room_number'
  },
  type: { type: DataTypes.STRING(50), allowNull: false },
  price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  capacity: { type: DataTypes.INTEGER, defaultValue: 2 },

  // 🆕 THÔNG TIN GIƯỜNG
  bedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'bed_count',
    comment: 'Số giường trong phòng'
  },
  bedType: {
    type: DataTypes.STRING(50),
    defaultValue: 'Giường đôi',
    field: 'bed_type',
    comment: 'Loại giường: King, Queen, Twin, Single, Giường đôi'
  },
  extraBed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'extra_bed',
    comment: 'Có thể kê thêm giường không'
  },

  description: { type: DataTypes.TEXT },
  amenities: { type: DataTypes.JSON },
  status: {
    type: DataTypes.ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE'),
    defaultValue: 'AVAILABLE'
  },
  image: { type: DataTypes.STRING(500) }
}, {
  tableName: 'rooms',
  timestamps: true
});

module.exports = Room;