const Expense = require('../models/Expense');
const Company = require('../models/Company');
const { convertCurrency } = require('../services/currencyService');
const { parseReceipt } = require('../services/ocrService');
const { paginate } = require('../utils/pagination');
const { logAudit } = require('../services/auditService');
const path = require('path');

exports.submitExpense = async (req, res) => {
  try {
    const { amount, originalCurrency, category, description, date, vendorName } = req.body;
    const userId = req.user.id;
    const companyId = req.user.companyId;

    // Get company currency
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    // Convert currency
    const { convertedAmount, rate } = await convertCurrency(amount, originalCurrency, company.defaultCurrency);

    // Get receipt path if uploaded
    const receiptUrl = req.file ? req.file.path : null;
    if (!receiptUrl) return res.status(400).json({ message: 'Receipt image is required' });

    const expense = await Expense.create({
      userId,
      companyId,
      amount,
      originalCurrency,
      convertedAmount,
      companyCurrency: company.defaultCurrency,
      exchangeRate: rate,
      category,
      description,
      date: date || Date.now(),
      receiptUrl,
      vendorName,
      status: 'Pending'
    });

    await logAudit(userId, 'SUBMIT_EXPENSE', 'EXPENSE', { expenseId: expense._id }, req.ip);

    res.status(201).json({
      message: 'Expense submitted successfully',
      expense
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.scanReceipt = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No receipt file provided' });

    const result = await parseReceipt(req.file.path);
    
    res.json({
      message: 'OCR Scan complete',
      data: {
        amount: result.amount,
        date: result.date,
        vendorName: result.vendorName,
        receiptUrl: req.file.path
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyExpenses = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const query = { userId: req.user.id };
    
    if (status) query.status = status;

    const result = await paginate(Expense, query, { page, limit });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, companyId: req.user.companyId })
      .populate('userId', 'name email');
    
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecentExpenses = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { startDate, endDate } = req.query;
    
    let query = { companyId };
    
    if (userRole === 'Manager') {
      const teamMembers = await User.find({ managerId: userId }).select('_id');
      const teamIds = teamMembers.map(m => m._id);
      query.userId = { $in: teamIds };
    } else if (userRole === 'Employee') {
      query.userId = userId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email role');
    
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const { page, limit, status, userId, category } = req.query;
    const query = { companyId: req.user.companyId };
    
    if (status) query.status = status;
    if (userId) query.userId = userId;
    if (category) query.category = category;

    const result = await paginate(Expense, query, { page, limit, populate: { path: 'userId', select: 'name email' } });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
