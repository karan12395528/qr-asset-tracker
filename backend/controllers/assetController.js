const assetService = require('../services/assetService');

// GET all assets
exports.getAllAssets = async (req, res) => {
  try {
    // If SuperAdmin provides a targetCompanyId, use it instead of their own
    let companyId = req.user.company_id;
    if (req.user.role === 'superadmin' && req.query.targetCompanyId) {
      companyId = req.query.targetCompanyId;
    }
    const assets = await assetService.getAllAssets(req.query, companyId);
    res.json(assets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET single asset
exports.getAssetByIdentifier = async (req, res) => {
  try {
    let companyId = req.user.company_id;
    if (req.user.role === 'superadmin' && req.query.targetCompanyId) {
      companyId = req.query.targetCompanyId;
    }
    const asset = await assetService.getAssetByIdentifier(req.params.identifier, companyId);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    res.json(asset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// CREATE asset
exports.createAsset = async (req, res) => {
  try {
    const asset = await assetService.createAsset(req.body, req.user);
    res.status(201).json(asset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// UPDATE asset
exports.updateAsset = async (req, res) => {
  try {
    const asset = await assetService.updateAsset(req.params.id, req.body, req.user);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    res.json(asset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE asset
exports.deleteAsset = async (req, res) => {
  try {
    const deleted = await assetService.deleteAsset(req.params.id, req.user.company_id);
    if (!deleted) return res.status(404).json({ error: 'Asset not found' });
    res.json({ message: 'Asset deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};