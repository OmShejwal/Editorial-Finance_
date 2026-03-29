const express = require('express');
const router = express.Router();
const { submitExpense, scanReceipt, getMyExpenses, getExpenseById, getRecentExpenses, getAllExpenses } = require('../controllers/expenseController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../config/multerConfig');

router.use(protect);

router.post('/', upload.single('receipt'), submitExpense);
router.post('/scan-receipt', upload.single('receipt'), scanReceipt);
router.get('/my', getMyExpenses);
router.get('/recent', getRecentExpenses);
router.get('/', getAllExpenses);
router.get('/:id', getExpenseById);

module.exports = router;
