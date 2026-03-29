const ApprovalFlow = require('../models/ApprovalFlow');
const ApprovalLog = require('../models/ApprovalLog');
const Expense = require('../models/Expense');
const User = require('../models/User');

const evaluateWorkflow = async (expenseId) => {
  try {
    const expense = await Expense.findById(expenseId);
    if (!expense) throw new Error('Expense not found');

    const flow = await ApprovalFlow.findOne({ companyId: expense.companyId });
    if (!flow) {
      // Default fallback if no flow defined: Require Manager approval first
      return { status: 'Pending', nextStep: 0, requiredRole: 'Manager' };
    }

    const { steps, conditionalRules, isManagerApproverFirst } = flow;
    const currentLogs = await ApprovalLog.find({ expenseId, status: 'Approved' });
    const approvalsCount = currentLogs.length;

    // Better way: get the actual roles that have approved
    const approvers = await User.find({ _id: { $in: currentLogs.map(l => l.approverId) } });
    const approverRoles = approvers.map(u => u.role);

    // Filter steps that are applicable based on threshold
    const applicableSteps = steps.filter(step => expense.convertedAmount >= step.threshold);

    // Check if manager approval is required first
    if (isManagerApproverFirst && !approverRoles.includes('Manager')) {
      return { status: 'Pending', nextStep: 0, requiredRole: 'Manager', completed: false };
    }

    // Check Conditional Rules
    if (conditionalRules.ruleType === 'UNANIMOUS') {
      const allApproved = applicableSteps.every(step => approverRoles.includes(step.role));
      if (allApproved) {
        expense.status = 'Approved';
        await expense.save();
        return { status: 'Approved', completed: true };
      }
      
      // Return roles that haven't approved yet
      const remainingRoles = applicableSteps
        .filter(step => !approverRoles.includes(step.role))
        .map(step => step.role);
      
      return { 
        status: 'Pending', 
        requiredRoles: remainingRoles, 
        requiredRole: remainingRoles[0], // fallback for singular check
        completed: false 
      };

    } else if (conditionalRules.ruleType === 'FIRST_TO_ACT') {
      const anyApproved = applicableSteps.some(step => approverRoles.includes(step.role));
      if (anyApproved || currentLogs.length > 0) {
        expense.status = 'Approved';
        await expense.save();
        return { status: 'Approved', completed: true };
      }

      const eligibleRoles = applicableSteps.map(step => step.role);
      return { 
        status: 'Pending', 
        requiredRoles: eligibleRoles, 
        requiredRole: eligibleRoles[0], // fallback
        completed: false 
      };

    } else if (conditionalRules.ruleType === 'Percentage') {
      const percentageMet = (approvalsCount / applicableSteps.length) * 100 >= conditionalRules.percentageRequired;
      if (percentageMet) {
        expense.status = 'Approved';
        await expense.save();
        return { status: 'Approved', completed: true };
      }
      
      const eligibleRoles = applicableSteps.map(step => step.role);
      return { 
        status: 'Pending', 
        requiredRoles: eligibleRoles, 
        requiredRole: eligibleRoles[0],
        completed: false 
      };

    } else if (conditionalRules.ruleType === 'Specific') {
      const specificApproved = currentLogs.some(log => log.approverId.toString() === conditionalRules.specificApproverId.toString());
      if (specificApproved) {
        expense.status = 'Approved';
        await expense.save();
        return { status: 'Approved', completed: true };
      }

      return { 
        status: 'Pending', 
        requiredApproverId: conditionalRules.specificApproverId,
        requiredRole: 'Admin', // Assume Admin or the specific person
        completed: false 
      };

    } else if (conditionalRules.ruleType === 'Hybrid') {
      const percentageMet = (approvalsCount / applicableSteps.length) * 100 >= conditionalRules.percentageRequired;
      const specificApproved = currentLogs.some(log => log.approverId.toString() === conditionalRules.specificApproverId.toString());
      if (percentageMet || specificApproved) {
        expense.status = 'Approved';
        await expense.save();
        return { status: 'Approved', completed: true };
      }

      const eligibleRoles = applicableSteps.map(step => step.role);
      return { 
        status: 'Pending', 
        requiredRoles: eligibleRoles, 
        requiredRole: eligibleRoles[0],
        completed: false 
      };
    }

    // Default sequential flow
    // Find the next required step based on threshold
    let nextStepIndex = approvalsCount;
    while (nextStepIndex < steps.length) {
      const step = steps[nextStepIndex];
      if (expense.convertedAmount >= step.threshold) {
        break; // Found a step that is required
      }
      nextStepIndex++;
    }

    if (nextStepIndex >= steps.length) {
      expense.status = 'Approved';
      await expense.save();
      return { status: 'Approved', completed: true };
    }

    // Move to next step
    expense.currentStep = nextStepIndex;
    await expense.save();

    const nextStepInfo = steps[expense.currentStep];
    return { 
      status: 'Pending', 
      nextStep: expense.currentStep, 
      requiredRole: nextStepInfo ? nextStepInfo.role : 'Admin', 
      completed: false 
    };
  } catch (error) {
    console.error('Workflow Error:', error.message);
    throw error;
  }
};

module.exports = {
  evaluateWorkflow
};
