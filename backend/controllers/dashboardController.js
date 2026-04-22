const dashboardService = require('../services/dashboardService');

// GET dashboard stats
exports.getStats = async (req, res) => {
  try {
    const stats = await dashboardService.getStats(req.user.company_id);
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET audit log
exports.getAuditLog = async (req, res) => {
  try {
    const log = await dashboardService.getAuditLog(req.query, req.user.company_id);
    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};