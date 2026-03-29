const mongoose = require('mongoose');

const approvalLogSchema = new mongoose.Schema({
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    required: true
  },
  approverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Approved', 'Rejected'],
    required: true
  },
  comment: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexing for faster logs lookup
approvalLogSchema.index({ expenseId: 1, status: 1 });

module.exports = mongoose.model('ApprovalLog', approvalLogSchema);
