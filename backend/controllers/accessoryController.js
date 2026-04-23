const accessoryService = require('../services/accessoryService');

exports.getAccessories = async (req, res) => {
  try {
    const data = await accessoryService.getAccessories(req.params.assetId, req.user.company_id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.addAccessory = async (req, res) => {
  try {
    const data = await accessoryService.addAccessory(req.body, req.user.company_id);
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    if (err.message === 'Asset ID and name required')
      return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteAccessory = async (req, res) => {
  try {
    const deleted = await accessoryService.deleteAccessory(req.params.id, req.user.company_id);
    if (!deleted) return res.status(404).json({ error: 'Accessory not found' });
    res.json({ message: 'Accessory deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
