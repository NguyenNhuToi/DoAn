const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  updateBookingStatus,
  cancelBooking,
  deleteBooking,
  deleteAllBookings,
  paymentBooking,
  getInvoice
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.put('/:id/status', protect, authorize('ADMIN', 'RECEPTIONIST'), updateBookingStatus);
router.put('/:id/pay', protect, paymentBooking);
router.get('/:id/invoice', protect, getInvoice);
router.delete('/:id', protect, cancelBooking);
router.delete('/:id/permanent', protect, deleteBooking);
router.delete('/delete-all', protect, authorize('ADMIN'), deleteAllBookings);

module.exports = router;