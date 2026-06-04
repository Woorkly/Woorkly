const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authRequired, requireRole } = require('../middlewares/auth');

router.get('/dashboard', authRequired, requireRole('admin'), adminController.getDashboardStats);

module.exports = router;