const dashboardService = require('../services/dashboardService');

// GET STATS
exports.getStats = async (req, res) => {
  try {
    const data = await dashboardService.getStats();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET AUDIT LOG
exports.getAuditLog = async (req, res) => {
  try {
    const data = await dashboardService.getAuditLog(req.query);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};