const express = require('express');
const router = express.Router();
const { getCompany, updateCompany } = require('../controllers/companyController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);
router.get('/', getCompany);
router.patch('/', restrictTo('Admin', 'Manager'), updateCompany);

module.exports = router;