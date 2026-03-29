const User = require('../models/User');
const Company = require('../models/Company');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwtUtils');
const { getCountryCurrency } = require('../services/countryService');
const { logAudit } = require('../services/auditService');

exports.signup = async (req, res) => {
  try {
    const { name, email, password, companyName, country } = req.body;

    // Check if user or company already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const companyExists = await Company.findOne({ name: companyName });
    if (companyExists) {
      return res.status(400).json({ message: 'Company already exists' });
    }

    // Fetch default currency from REST Countries API
    const defaultCurrency = await getCountryCurrency(country);

    // Create Company
    const company = await Company.create({
      name: companyName,
      country,
      defaultCurrency
    });

    // Create Admin User
    const user = await User.create({
      name,
      email,
      password,
      role: 'Admin',
      companyId: company._id
    });

    // Link company to its admin
    company.admin = user._id;
    await company.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to DB
    user.refreshToken = refreshToken;
    await user.save();

    await logAudit(user._id, 'SIGNUP', 'AUTH', { companyId: company._id }, req.ip);

    res.status(201).json({
      message: 'Signup successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: {
          id: company._id,
          name: company.name,
          defaultCurrency: company.defaultCurrency
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    await logAudit(user._id, 'LOGIN', 'AUTH', {}, req.ip);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('companyId', 'name defaultCurrency');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
