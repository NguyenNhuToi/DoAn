const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  roomId: { type: DataTypes.INTEGER, allowNull: false, field: 'room_id' },
  checkInDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'check_in_date' },
  checkOutDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'check_out_date' },
  totalPrice: { type: DataTypes.DECIMAL(15, 2), allowNull: false, field: 'total_price' },
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  paymentMethod: { type: DataTypes.STRING(50), field: 'payment_method' },
  paymentStatus: {
    type: DataTypes.ENUM('UNPAID', 'PAID', 'REFUNDED'),
    defaultValue: 'UNPAID', field: 'payment_status'
  },
  specialRequests: { type: DataTypes.TEXT, field: 'special_requests' },
  services: { type: DataTypes.JSON, defaultValue: [] },
  adults: { type: DataTypes.INTEGER, defaultValue: 1 },

  // 🆕 TÁCH 2 LOẠI TRẺ EM
  childrenUnder6: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'children_under_6',
    comment: 'Trẻ < 6 tuổi — miễn phí, không tính vào sức chứa'
  },
  children6to12: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'children_6_12',
    comment: 'Trẻ 6-12 tuổi — phụ thu 100k/đêm, tính vào sức chứa'
  },

  // Giữ lại trường cũ để tương thích (sẽ tính = childrenUnder6 + children6to12)
  children: { type: DataTypes.INTEGER, defaultValue: 0 },

  // 🆕 Thông tin khách hàng
  guestName: { type: DataTypes.STRING(100), field: 'guest_name' },
  guestPhone: { type: DataTypes.STRING(20), field: 'guest_phone' },
  guestEmail: { type: DataTypes.STRING(100), field: 'guest_email' },
  guestIdCard: { type: DataTypes.STRING(20), field: 'guest_id_card' }
}, {
  tableName: 'bookings',
  timestamps: true
});

module.exports = Booking;