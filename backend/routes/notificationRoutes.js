const express = require('express');
const router = express.Router();
const { getNotifications } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);
router.get('/', getNotifications);

module.exports = router;