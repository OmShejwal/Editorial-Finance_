const Expense = require('../models/Expense');
const ApprovalLog = require('../models/ApprovalLog');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const companyId = req.user.companyId;

    let notifications = [];

    // Pending approvals for managers/admins
    if (userRole === 'Manager' || userRole === 'Admin') {
      const pendingExpenses = await Expense.find({ companyId, status: 'Pending' })
        .populate('userId', 'name')
        .limit(5);
      
      pendingExpenses.forEach(exp => {
        notifications.push({
          type: 'APPROVAL_REQUEST',
          title: 'New Approval Request',
          message: `${exp.userId.name} submitted an expense for $${exp.amount}`,
          expenseId: exp._id,
          createdAt: exp.createdAt
        });
      });
    }

    // Status updates for employees
    const recentLogs = await ApprovalLog.find()
      .populate({
        path: 'expenseId',
        match: { userId }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    recentLogs.filter(log => log.expenseId !== null).forEach(log => {
      notifications.push({
        type: 'STATUS_UPDATE',
        title: `Expense ${log.status}`,
        message: `Your expense for $${log.expenseId.amount} was ${log.status.toLowerCase()}`,
        expenseId: log.expenseId._id,
        createdAt: log.createdAt
      });
    });

    res.json(notifications.sort((a, b) => b.createdAt - a.createdAt));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};