const express = require('express');
const router = express.Router();
const {
  createUserByAdmin,
  getAllUsers,
  deleteUser,
  updateUserRole
} = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// 🛡️ Tất cả route đều yêu cầu ADMIN
router.use(protect, authorize('ADMIN'));

router.post('/users', createUserByAdmin);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

module.exports = router;