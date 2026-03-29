const mongoose = require('mongoose');

const approvalFlowSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    unique: true
  },
  isManagerApproverFirst: {
    type: Boolean,
    default: true
  },
  steps: [{
    role: {
      type: String,
      enum: ['Manager', 'Admin', 'Finance', 'Director'],
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    threshold: {
      type: Number,
      default: 0 // If expense > threshold, this step is required
    }
  }],
  conditionalRules: {
    percentageRequired: {
      type: Number,
      default: 100 // Default to 100% approval
    },
    specificApproverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ruleType: {
      type: String,
      enum: ['Percentage', 'Specific', 'Hybrid', 'Default', 'UNANIMOUS', 'FIRST_TO_ACT'],
      default: 'Default'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('ApprovalFlow', approvalFlowSchema);
