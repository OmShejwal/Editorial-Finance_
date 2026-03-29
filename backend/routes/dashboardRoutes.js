const express = require('express');
const router = express.Router();
const { getAdminDashboard, getManagerDashboard, getEmployeeDashboard, exportData, getMonthlySpend } = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/admin', restrictTo('Admin'), getAdminDashboard);
router.get('/manager', restrictTo('Manager'), getManagerDashboard);
router.get('/employee', restrictTo('Employee'), getEmployeeDashboard);
router.get('/monthly-spend', getMonthlySpend);
router.get('/export', exportData);

module.exports = router;
