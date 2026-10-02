const { Booking, Room, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const SERVICE_PRICES = {
  'Ăn sáng buffet': 100000,
  'Đưa đón sân bay': 200000,
  'Spa & Massage': 300000,
  'Giặt ủi': 50000,
  'Thuê xe máy': 150000,
  'Tour du lịch': 500000
};

const EXTRA_ADULT_FEE = 200000;       // Người lớn vượt sức chứa
const EXTRA_CHILD_6_12_FEE = 100000;  // Trẻ 6-12 tuổi
// Trẻ < 6 tuổi: miễn phí, không tính

const resetAutoIncrementIfEmpty = async () => {
  try {
    const count = await Booking.count();
    if (count === 0) {
      await sequelize.query('ALTER TABLE bookings AUTO_INCREMENT = 1');
    }
  } catch (error) {
    console.error('Lỗi reset:', error.message);
  }
};

exports.createBooking = async (req, res) => {
  try {
    const {
      roomId, checkInDate, checkOutDate,
      paymentMethod, specialRequests,
      services = [], adults = 1,
      childrenUnder6 = 0, children6to12 = 0,
      guestName, guestPhone, guestEmail, guestIdCard
    } = req.body;

    if (!guestName || !guestPhone) {
      return res.status(400).json({ message: 'Vui lòng nhập tên và SĐT khách hàng' });
    }

    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });

    if (room.status !== 'AVAILABLE') {
      return res.status(400).json({ message: 'Phòng đã được đặt' });
    }

    const conflict = await Booking.findOne({
      where: {
        roomId,
        status: ['PENDING', 'CONFIRMED', 'CHECKED_IN'],
        checkInDate: { [Op.lt]: checkOutDate },
        checkOutDate: { [Op.gt]: checkInDate }
      }
    });

    if (conflict) return res.status(400).json({ message: 'Phòng đã được đặt trong khoảng này' });

    const nights = Math.ceil(
      (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
    );

    // 💰 Tiền phòng
    const roomPrice = nights * parseFloat(room.price);

    // 🎁 Dịch vụ
    const servicesPrice = services.reduce((sum, s) => sum + (SERVICE_PRICES[s] || 0), 0);

    // 👥 TÍNH SỨC CHỨA
    // - Người lớn: tính vào sức chứa
    // - Trẻ 6-12 tuổi: tính vào sức chứa
    // - Trẻ < 6 tuổi: KHÔNG tính vào sức chứa (ngủ chung bố mẹ)
    const effectiveOccupancy = adults + children6to12;
    const baseCapacity = room.capacity || 2;
    const extraAdults = Math.max(0, effectiveOccupancy - baseCapacity);

    // 💰 PHỤ THU
    // - Người lớn vượt sức chứa: 200k/người/đêm
    // - Trẻ 6-12 tuổi: 100k/trẻ/đêm (luôn phụ thu)
    // - Trẻ < 6 tuổi: 0đ
    const extraAdultsFee = extraAdults * EXTRA_ADULT_FEE * nights;
    const extraChildrenFee = children6to12 * EXTRA_CHILD_6_12_FEE * nights;
    const extraFee = extraAdultsFee + extraChildrenFee;

    // 🎯 TỔNG TIỀN
    const totalPrice = roomPrice + servicesPrice + extraFee;

    // Lưu children = tổng 2 loại (để tương thích)
    const childrenTotal = childrenUnder6 + children6to12;

    const booking = await Booking.create({
      userId: req.user.id, roomId, checkInDate, checkOutDate,
      totalPrice, paymentMethod, specialRequests,
      services, adults,
      childrenUnder6, children6to12, children: childrenTotal,
      status: 'PENDING',
      guestName, guestPhone, guestEmail, guestIdCard
    });

    await room.update({ status: 'OCCUPIED' });

    console.log(`✅ Đặt phòng ${room.roomNumber} — Khách: ${guestName}`);
    console.log(`   - ${adults} NL, ${childrenUnder6} trẻ <6, ${children6to12} trẻ 6-12`);
    console.log(`   - Sức chứa hiệu dụng: ${effectiveOccupancy}/${baseCapacity}`);
    console.log(`   - Phụ thu: ${extraFee.toLocaleString('vi-VN')}đ`);
    console.log(`   - TỔNG: ${totalPrice.toLocaleString('vi-VN')}đ`);

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'CUSTOMER') where.userId = req.user.id;

    const bookings = await Booking.findAll({
      where,
      include: [
        { model: Room, as: 'room', attributes: ['id', 'roomNumber', 'type', 'price', 'capacity', 'image'] },
        { model: User, as: 'user', attributes: ['name', 'email', 'phone'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn' });

    await booking.update({ status });

    const room = await Room.findByPk(booking.roomId);
    if (status === 'CHECKED_IN') await room.update({ status: 'OCCUPIED' });
    else if (['CHECKED_OUT', 'CANCELLED'].includes(status))
      await room.update({ status: 'AVAILABLE' });

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn' });

    if (req.user.role === 'CUSTOMER' && booking.userId !== req.user.id)
      return res.status(403).json({ message: 'Không có quyền hủy' });

    await booking.update({ status: 'CANCELLED' });

    const room = await Room.findByPk(booking.roomId);
    if (room) await room.update({ status: 'AVAILABLE' });

    res.json({ success: true, message: 'Đã hủy đơn' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn' });

    if (req.user.role === 'CUSTOMER' && booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền xóa' });
    }

    const allowedStatuses = ['CANCELLED', 'CHECKED_OUT'];
    const isPaidConfirmed = booking.paymentStatus === 'PAID' && booking.status === 'CONFIRMED';

    if (!allowedStatuses.includes(booking.status) && !isPaidConfirmed) {
      return res.status(400).json({ message: 'Chỉ xóa được đơn đã hủy, đã trả phòng, hoặc đã thanh toán' });
    }

    const roomId = booking.roomId;
    await booking.destroy();

    const room = await Room.findByPk(roomId);
    if (room) await room.update({ status: 'AVAILABLE' });

    await resetAutoIncrementIfEmpty();

    res.json({ success: true, message: 'Đã xóa đơn vĩnh viễn' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAllBookings = async (req, res) => {
  try {
    await Booking.destroy({ where: {}, truncate: true });
    await sequelize.query('ALTER TABLE bookings AUTO_INCREMENT = 1');
    await Room.update({ status: 'AVAILABLE' }, { where: {} });
    res.json({ success: true, message: 'Đã xóa tất cả đơn và reset' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.paymentBooking = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn' });

    if (req.user.role === 'CUSTOMER' && booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền thanh toán' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Đơn đã hủy' });
    }

    if (booking.paymentStatus === 'PAID') {
      return res.status(400).json({ message: 'Đơn đã được thanh toán' });
    }

    await booking.update({
      paymentStatus: 'PAID',
      paymentMethod: paymentMethod || booking.paymentMethod || 'CASH'
    });

    if (booking.status === 'PENDING') {
      await booking.update({ status: 'CONFIRMED' });
    }

    const room = await Room.findByPk(booking.roomId);
    if (room) await room.update({ status: 'AVAILABLE' });

    res.json({ success: true, message: 'Thanh toán thành công', data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Room, as: 'room', attributes: ['id', 'roomNumber', 'type', 'price', 'capacity', 'image'] },
        { model: User, as: 'user', attributes: ['name', 'email', 'phone', 'address'] }
      ]
    });

    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn' });

    if (req.user.role === 'CUSTOMER' && booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền xem hóa đơn' });
    }

    const nights = Math.ceil(
      (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)
    );

    const totalPrice = parseFloat(booking.totalPrice);
    const roomPrice = nights * parseFloat(booking.room.price);

    // 👥 Tính sức chứa hiệu dụng
    const adults = booking.adults || 1;
    const childrenUnder6 = booking.childrenUnder6 || 0;
    const children6to12 = booking.children6to12 || 0;
    const baseCapacity = booking.room.capacity || 2;

    const effectiveOccupancy = adults + children6to12;
    const extraAdults = Math.max(0, effectiveOccupancy - baseCapacity);

    const extraAdultsFee = extraAdults * EXTRA_ADULT_FEE * nights;
    const extraChildrenFee = children6to12 * EXTRA_CHILD_6_12_FEE * nights;
    const extraFee = extraAdultsFee + extraChildrenFee;

    const servicesPrice = Math.max(0, totalPrice - roomPrice - extraFee);

    res.json({
      success: true,
      data: {
        booking,
        invoice: {
          nights,
          roomPrice,
          servicesPrice,
          extraFee,
          extraAdults,
          extraAdultsFee,
          childrenUnder6,
          children6to12,
          extraChildrenFee,
          baseCapacity,
          effectiveOccupancy,
          totalPrice,
          paymentStatus: booking.paymentStatus,
          paymentMethod: booking.paymentMethod
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};