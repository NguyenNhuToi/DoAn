const sequelize = require('../config/database');
const User = require('./User');
const Room = require('./Room');
const Booking = require('./Booking');

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Room.hasMany(Booking, { foreignKey: 'roomId', as: 'bookings' });
Booking.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

module.exports = { sequelize, User, Room, Booking };