const dashboardService = require('../services/dashboardService');

// GET dashboard stats
exports.getStats = async (req, res) => {
  try {
    const userToQuery = { ...req.user };
    if (req.user.role === 'superadmin' && req.query.targetCompanyId) {
      userToQuery.company_id = req.query.targetCompanyId;
      userToQuery.role = 'admin'; // Act as admin for stats calculation
    }
    const stats = await dashboardService.getStats(userToQuery);
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET audit log
exports.getAuditLog = async (req, res) => {
  try {
    const userToQuery = { ...req.user };
    if (req.user.role === 'superadmin' && req.query.targetCompanyId) {
      userToQuery.company_id = req.query.targetCompanyId;
      userToQuery.role = 'admin';
    }
    const log = await dashboardService.getAuditLog(req.query, userToQuery);
    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};