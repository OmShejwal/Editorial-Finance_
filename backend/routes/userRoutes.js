const express = require('express');
const router = express.Router();
const { createUser, getUsers, updateRole, deleteUser, updateProfile, updatePassword } = require('../controllers/userController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);

// Self-management
router.patch('/profile', updateProfile);
router.patch('/password', updatePassword);

// Admin only
router.use(restrictTo('Admin'));
router.post('/create', createUser);
router.get('/', getUsers);
router.patch('/:id/role', updateRole);
router.delete('/:id', deleteUser);

module.exports = router;
