const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Company = require('./models/Company');
const Expense = require('./models/Expense');
const ApprovalFlow = require('./models/ApprovalFlow');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/erms';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    console.log('Users cleared');
    await Company.deleteMany({});
    console.log('Companies cleared');
    await Expense.deleteMany({});
    console.log('Expenses cleared');
    await ApprovalFlow.deleteMany({});
    console.log('Flows cleared');

    // Create Company
    const company = await Company.create({
      name: 'Test Corp',
      country: 'USA',
      defaultCurrency: 'USD'
    });
    console.log('Company created');

    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed');

    // Create Admin
    const admin = await User.create({
      name: 'Test Admin',
      email: 'admin@erms.com',
      password: hashedPassword,
      role: 'Admin',
      companyId: company._id
    });
    console.log('Admin created');

    // Create Manager
    const manager = await User.create({
      name: 'Test Manager',
      email: 'manager@erms.com',
      password: hashedPassword,
      role: 'Manager',
      companyId: company._id,
      managerId: admin._id
    });
    console.log('Manager created');

    // Create Employee
    const employee = await User.create({
      name: 'Test Employee',
      email: 'employee@erms.com',
      password: hashedPassword,
      role: 'Employee',
      companyId: company._id,
      managerId: manager._id
    });
    console.log('Employee created');

    company.admin = admin._id;
    await company.save();
    console.log('Company updated');

    // Create Approval Flow
    await ApprovalFlow.create({
      companyId: company._id,
      isManagerApproverFirst: true,
      steps: [
        { role: 'Manager', order: 1, threshold: 0 },
        { role: 'Admin', order: 2, threshold: 500 }
      ],
      conditionalRules: {
        ruleType: 'Default',
        percentageRequired: 100
      }
    });
    console.log('Flow created');

    // Create Sample Expenses
    const currentYear = new Date().getFullYear();
    await Expense.create([
      {
        userId: employee._id,
        companyId: company._id,
        amount: 150,
        originalCurrency: 'USD',
        convertedAmount: 150,
        companyCurrency: 'USD',
        exchangeRate: 1,
        category: 'Travel',
        description: 'Flight to NYC',
        receiptUrl: 'uploads/sample-receipt.jpg',
        status: 'Pending',
        vendorName: 'Delta Airlines',
        date: new Date()
      },
      {
        userId: employee._id,
        companyId: company._id,
        amount: 600,
        originalCurrency: 'USD',
        convertedAmount: 600,
        companyCurrency: 'USD',
        exchangeRate: 1,
        category: 'Software',
        description: 'Yearly AWS bill',
        receiptUrl: 'uploads/sample-receipt.jpg',
        status: 'Pending',
        vendorName: 'Amazon Web Services',
        date: new Date()
      },
      // Approved Expenses for the graph
      {
        userId: employee._id,
        companyId: company._id,
        amount: 1200,
        originalCurrency: 'USD',
        convertedAmount: 1200,
        companyCurrency: 'USD',
        exchangeRate: 1,
        category: 'Equipment',
        description: 'MacBook Pro',
        receiptUrl: 'uploads/sample-receipt.jpg',
        status: 'Approved',
        vendorName: 'Apple',
        date: new Date(currentYear, 0, 15) // Jan
      },
      {
        userId: employee._id,
        companyId: company._id,
        amount: 800,
        originalCurrency: 'USD',
        convertedAmount: 800,
        companyCurrency: 'USD',
        exchangeRate: 1,
        category: 'Marketing',
        description: 'Google Ads',
        receiptUrl: 'uploads/sample-receipt.jpg',
        status: 'Approved',
        vendorName: 'Google',
        date: new Date(currentYear, 1, 10) // Feb
      },
      {
        userId: employee._id,
        companyId: company._id,
        amount: 2500,
        originalCurrency: 'USD',
        convertedAmount: 2500,
        companyCurrency: 'USD',
        exchangeRate: 1,
        category: 'Travel',
        description: 'Conference in London',
        receiptUrl: 'uploads/sample-receipt.jpg',
        status: 'Approved',
        vendorName: 'British Airways',
        date: new Date(currentYear, 2, 20) // Mar
      }
    ]);
    console.log('Expenses created');

    console.log('Seeding complete!');
    console.log('Admin: admin@erms.com / password123');
    console.log('Manager: manager@erms.com / password123');
    console.log('Employee: employee@erms.com / password123');
    console.log('Seeded 2 pending and 3 approved expenses, and a default workflow.');

    process.exit(0);
  } catch (error) {
    console.error('Detailed Seeding error:', error.message);
    if (error.errors) console.error('Validation errors:', JSON.stringify(error.errors));
    process.exit(1);
  }
};

seed();
