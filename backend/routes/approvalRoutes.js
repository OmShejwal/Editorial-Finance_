const express = require('express');
const router = express.Router();
const { getPendingApprovals, approveExpense, rejectExpense, configureWorkflow, overrideApproval, escalateExpense, batchApprove } = require('../controllers/approvalController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);

// Admin or Manager can view/approve/escalate
router.get('/pending', restrictTo('Admin', 'Manager'), getPendingApprovals);
router.post('/batch-approve', restrictTo('Admin', 'Manager'), batchApprove);
router.post('/:expenseId/approve', restrictTo('Admin', 'Manager'), approveExpense);
router.post('/:expenseId/reject', restrictTo('Admin', 'Manager'), rejectExpense);
router.post('/:expenseId/escalate', restrictTo('Manager'), escalateExpense);

// Only Admin can configure or override
router.get('/configure', restrictTo('Admin'), (req, res, next) => {
  const ApprovalFlow = require('../models/ApprovalFlow');
  ApprovalFlow.findOne({ companyId: req.user.companyId })
    .then(flow => res.json(flow || { steps: [], conditionalRules: {} }))
    .catch(next);
});
router.post('/configure', restrictTo('Admin'), configureWorkflow);
router.post('/:expenseId/override', restrictTo('Admin'), overrideApproval);

module.exports = router;
