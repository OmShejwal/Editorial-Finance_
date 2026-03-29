const Expense = require('../models/Expense');
const ApprovalLog = require('../models/ApprovalLog');
const ApprovalFlow = require('../models/ApprovalFlow');
const User = require('../models/User');
const { evaluateWorkflow } = require('../services/approvalService');

exports.getPendingApprovals = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const companyId = req.user.companyId;

    // Fetch all pending expenses for the company
    const expenses = await Expense.find({
      companyId,
      status: 'Pending'
    }).populate('userId', 'name email managerId');

    // Filter expenses based on whether the current user is the correct approver
    const filteredExpenses = await Promise.all(expenses.map(async (expense) => {
      // Admin sees everything
      if (userRole === 'Admin') return expense;

      const workflowStatus = await evaluateWorkflow(expense._id);
      
      // If the next required role is 'Manager', check if the current user is the manager
      if (workflowStatus.requiredRole === 'Manager' || (workflowStatus.requiredRoles && workflowStatus.requiredRoles.includes('Manager'))) {
        if (expense.userId.managerId && expense.userId.managerId.toString() === userId.toString()) {
          return expense;
        }
      }
      
      // If the next required role is something else, check if the current user has that role
      if (workflowStatus.requiredRole === userRole || (workflowStatus.requiredRoles && workflowStatus.requiredRoles.includes(userRole))) {
        return expense;
      }

      return null;
    }));

    res.json(filteredExpenses.filter(e => e !== null));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.overrideApproval = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { status, comment } = req.body;
    const adminId = req.user.id;

    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    expense.status = status; // 'Approved' or 'Rejected'
    await expense.save();

    await ApprovalLog.create({
      expenseId,
      approverId: adminId,
      status,
      comment: `[Admin Override]: ${comment}`
    });

    res.json({ message: `Expense ${status} by Admin override`, expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { comment } = req.body;
    const approverId = req.user.id;

    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    // Log the approval
    await ApprovalLog.create({
      expenseId,
      approverId,
      status: 'Approved',
      comment
    });

    // Evaluate workflow logic (conditional approvals, next steps)
    const workflowStatus = await evaluateWorkflow(expenseId);

    res.json({
      message: 'Expense approved successfully',
      workflowStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { comment } = req.body;
    const approverId = req.user.id;

    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    expense.status = 'Rejected';
    await expense.save();

    await ApprovalLog.create({
      expenseId,
      approverId,
      status: 'Rejected',
      comment
    });

    res.json({ message: 'Expense rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.escalateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { comment } = req.body;
    const managerId = req.user.id;

    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    // In a real system, escalation might skip the current step
    // and move directly to Admin or a higher step
    expense.currentStep += 1;
    await expense.save();

    await ApprovalLog.create({
      expenseId,
      approverId: managerId,
      status: 'Approved', // Marking as approved at this level to move it forward
      comment: `[Escalated]: ${comment}`
    });

    res.json({ message: 'Expense escalated to next level', expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin can configure workflow
exports.configureWorkflow = async (req, res) => {
  try {
    const { steps, conditionalRules } = req.body;
    const companyId = req.user.companyId;

    let flow = await ApprovalFlow.findOneAndUpdate(
      { companyId },
      { steps, conditionalRules },
      { new: true, upsert: true }
    );

    res.json({ message: 'Workflow configured successfully', flow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.batchApprove = async (req, res) => {
  try {
    const { expenseIds, comment } = req.body;
    const approverId = req.user.id;

    if (!Array.isArray(expenseIds) || expenseIds.length === 0) {
      return res.status(400).json({ message: 'No expenses selected for batch approval' });
    }

    const results = await Promise.all(expenseIds.map(async (id) => {
      try {
        const expense = await Expense.findById(id);
        if (!expense) return { id, status: 'error', message: 'Not found' };

        await ApprovalLog.create({
          expenseId: id,
          approverId,
          status: 'Approved',
          comment: comment || 'Batch approved'
        });

        const workflowStatus = await evaluateWorkflow(id);
        return { id, status: 'success', workflowStatus };
      } catch (err) {
        return { id, status: 'error', message: err.message };
      }
    }));

    res.json({ message: 'Batch approval process completed', results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
