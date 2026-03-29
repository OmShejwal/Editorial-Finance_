const express = require('express');
const router = express.Router();
const { search } = require('../controllers/searchController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);
router.get('/', search);

module.exports = router;