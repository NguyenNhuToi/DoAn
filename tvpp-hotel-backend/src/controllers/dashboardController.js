const { Booking, Room, User } = require('../models');
const { Op, fn, col } = require('sequelize');

exports.getStats = async (req, res) => {
  try {
    const totalRooms = await Room.count();
    const totalUsers = await User.count({ where: { role: 'CUSTOMER' } });
    const pendingBookings = await Booking.count({ where: { status: 'PENDING' } });
    const checkedIn = await Booking.count({ where: { status: 'CHECKED_IN' } });
    const revenue = await Booking.sum('totalPrice', { where: { paymentStatus: 'PAID' } });

    res.json({
      success: true,
      data: { totalRooms, totalUsers, pendingBookings, checkedIn, revenue: revenue || 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRevenue = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const data = await Booking.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('SUM', col('totalPrice')), 'revenue']
      ],
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']]
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};