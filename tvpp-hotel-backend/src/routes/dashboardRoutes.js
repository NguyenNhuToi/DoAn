const express = require('express');
const router = express.Router();
const { getStats, getRevenue } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/stats', protect, authorize('ADMIN'), getStats);
router.get('/revenue', protect, authorize('ADMIN'), getRevenue);

module.exports = router;