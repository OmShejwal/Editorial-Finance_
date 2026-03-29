const AuditLog = require('../models/AuditLog');

const logAudit = async (userId, action, module, details = {}, ipAddress = '') => {
  try {
    await AuditLog.create({
      userId,
      action,
      module,
      details,
      ipAddress
    });
  } catch (error) {
    console.error('Audit Log Error:', error.message);
  }
};

module.exports = {
  logAudit
};
