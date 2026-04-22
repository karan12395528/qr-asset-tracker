const checkoutService = require('../services/checkoutService');

// CHECKOUT
exports.checkoutAsset = async (req, res) => {
  try {
    const result = await checkoutService.checkoutAsset(req.body, req.user);
    res.json(result);
  } catch (err) {
    console.error(err);
    if (err.message === 'Asset tag required' || err.message === 'Asset is already checked out') {
      return res.status(400).json({ error: err.message });
    }
    if (err.message === 'Asset not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// RETURN
exports.returnAsset = async (req, res) => {
  try {
    const result = await checkoutService.returnAsset(req.body, req.user);
    res.json(result);
  } catch (err) {
    console.error(err);
    if (err.message === 'Asset tag required' || err.message === 'Asset is already available') {
      return res.status(400).json({ error: err.message });
    }
    if (err.message === 'Asset not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// GET ACTIVE
exports.getActiveCheckouts = async (req, res) => {
  try {
    const data = await checkoutService.getActiveCheckouts(req.user.company_id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};