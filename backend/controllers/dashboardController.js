const Expense = require('../models/Expense');
const User = require('../models/User');
const Company = require('../models/Company');

exports.getAdminDashboard = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { startDate, endDate } = req.query;

    const matchQuery = { companyId, status: 'Approved' };
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate && !isNaN(new Date(startDate))) matchQuery.date.$gte = new Date(startDate);
      if (endDate && !isNaN(new Date(endDate))) matchQuery.date.$lte = new Date(endDate);
      if (Object.keys(matchQuery.date).length === 0) delete matchQuery.date;
    }

    const totalExpenses = await Expense.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: "$convertedAmount" } } }
    ]);

    const pendingQuery = { companyId, status: 'Pending' };
    if (startDate || endDate) {
      pendingQuery.date = {};
      if (startDate) pendingQuery.date.$gte = new Date(startDate);
      if (endDate) pendingQuery.date.$lte = new Date(endDate);
    }

    const pendingApprovals = await Expense.countDocuments(pendingQuery);
    const totalUsers = await User.countDocuments({ companyId });
    const company = await Company.findById(companyId);

    res.json({
      totalExpenses: totalExpenses[0] ? totalExpenses[0].total : 0,
      pendingApprovals,
      totalUsers,
      companyCurrency: company ? company.defaultCurrency : 'USD',
      role: 'Admin'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getManagerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.companyId;
    const { startDate, endDate } = req.query;

    // Fetch team members
    const teamMembers = await User.find({ managerId: userId }).select('_id');
    const teamIds = teamMembers.map(m => m._id);

    const matchQuery = { userId: { $in: teamIds }, status: 'Approved' };
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate && !isNaN(new Date(startDate))) matchQuery.date.$gte = new Date(startDate);
      if (endDate && !isNaN(new Date(endDate))) matchQuery.date.$lte = new Date(endDate);
      if (Object.keys(matchQuery.date).length === 0) delete matchQuery.date;
    }

    const teamExpenses = await Expense.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: "$convertedAmount" } } }
    ]);

    const pendingQuery = { companyId, status: 'Pending' };
    if (startDate || endDate) {
      pendingQuery.date = {};
      if (startDate) pendingQuery.date.$gte = new Date(startDate);
      if (endDate) pendingQuery.date.$lte = new Date(endDate);
    }

    const pendingApprovals = await Expense.countDocuments(pendingQuery);
    const teamMembersCount = await User.countDocuments({ managerId: userId });
    const company = await Company.findById(companyId);

    res.json({
      teamExpenses: teamExpenses[0] ? teamExpenses[0].total : 0,
      pendingApprovals,
      teamMembersCount,
      companyCurrency: company ? company.defaultCurrency : 'USD',
      role: 'Manager'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const matchQuery = { userId, status: 'Approved' };
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const myExpenses = await Expense.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: "$convertedAmount" } } }
    ]);

    const pendingQuery = { userId, status: 'Pending' };
    if (startDate || endDate) {
      pendingQuery.date = {};
      if (startDate) pendingQuery.date.$gte = new Date(startDate);
      if (endDate) pendingQuery.date.$lte = new Date(endDate);
    }

    const pendingCount = await Expense.countDocuments(pendingQuery);
    const user = await User.findById(userId).populate('companyId');

    res.json({
      myTotalApproved: myExpenses[0] ? myExpenses[0].total : 0,
      pendingCount,
      companyCurrency: user.companyId.defaultCurrency,
      role: 'Employee'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMonthlySpend = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { startDate, endDate } = req.query;

    const matchQuery = { status: 'Approved' };
    
    if (userRole === 'Admin') {
      matchQuery.companyId = companyId;
    } else if (userRole === 'Manager') {
      const teamMembers = await User.find({ managerId: userId }).select('_id');
      const teamIds = teamMembers.map(m => m._id);
      matchQuery.userId = { $in: teamIds };
    } else {
      matchQuery.userId = userId;
    }

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const monthlySpend = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $month: "$date" },
          total: { $sum: "$convertedAmount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Format for Chart.js
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = Array(12).fill(0);
    monthlySpend.forEach(item => {
      data[item._id - 1] = item.total;
    });

    res.json({ labels, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.exportData = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const expenses = await Expense.find({ companyId }).populate('userId', 'name email');
    
    // Simple CSV generation
    let csv = 'User,Email,Date,Category,Amount,Currency,Converted Amount,Status\n';
    expenses.forEach(e => {
      csv += `${e.userId.name},${e.userId.email},${e.date.toISOString()},${e.category},${e.amount},${e.originalCurrency},${e.convertedAmount},${e.status}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
