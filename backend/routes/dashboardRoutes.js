const express = require('express');
const router = express.Router();
const { getAdminDashboard, getManagerDashboard, getEmployeeDashboard, exportData, getMonthlySpend, getCategoryAllocation } = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/admin', restrictTo('Admin', 'Manager'), getAdminDashboard);
router.get('/manager', restrictTo('Manager'), getManagerDashboard);
router.get('/employee', getEmployeeDashboard);
router.get('/monthly-spend', getMonthlySpend);
router.get('/category-allocation', getCategoryAllocation);
router.get('/export', exportData);

module.exports = router;
