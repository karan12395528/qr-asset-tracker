const qrService = require('../services/qrService');

exports.getQRCode = async (req, res) => {
  try {
    const data = await qrService.generateQRCode(req.params.tag, req.user.company_id);
    res.json(data);
  } catch (err) {
    console.error(err);
    if (err.message === 'Asset not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
};