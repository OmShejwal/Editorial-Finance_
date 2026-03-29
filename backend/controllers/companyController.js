const Company = require('../models/Company');

exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const { name, defaultCurrency, country } = req.body;
    const company = await Company.findByIdAndUpdate(
      req.user.companyId,
      { name, defaultCurrency, country },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Company settings updated successfully', company });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};