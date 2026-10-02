const express = require('express');
const router = express.Router();
const {
  getRooms, getRoomById, createRoom, updateRoom, deleteRoom
} = require('../controllers/roomController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', getRooms);
router.get('/:id', getRoomById);
router.post('/', protect, authorize('ADMIN'), createRoom);
router.put('/:id', protect, authorize('ADMIN'), updateRoom);
router.delete('/:id', protect, authorize('ADMIN'), deleteRoom);

module.exports = router;