const User = require('../models/User');
const Expense = require('../models/Expense');

exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    const companyId = req.user.companyId;

    if (!q) return res.json({ users: [], expenses: [] });

    const users = await User.find({
      companyId,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).limit(5).select('name email role');

    const expenses = await Expense.find({
      companyId,
      $or: [
        { category: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { vendorName: { $regex: q, $options: 'i' } }
      ]
    }).limit(5).populate('userId', 'name');

    res.json({ users, expenses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};