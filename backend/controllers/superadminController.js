const superadminService = require('../services/superadminService');

exports.getOverview = async (req, res) => {
  try {
    const data = await superadminService.getGlobalStats();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
