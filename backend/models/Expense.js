const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  originalCurrency: {
    type: String,
    required: true
  },
  convertedAmount: {
    type: Number,
    required: true
  },
  companyCurrency: {
    type: String,
    required: true
  },
  exchangeRate: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  receiptUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  currentStep: {
    type: Number,
    default: 0
  },
  approverIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  vendorName: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexing for faster queries
expenseSchema.index({ userId: 1, status: 1 });
expenseSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
