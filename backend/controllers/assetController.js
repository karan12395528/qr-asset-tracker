const assetService = require('../services/assetService');

// GET all assets
exports.getAllAssets = async (req, res) => {
  try {
    const assets = await assetService.getAllAssets(req.query);
    res.json(assets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET single asset
exports.getAssetByIdentifier = async (req, res) => {
  try {
    const asset = await assetService.getAssetByIdentifier(req.params.identifier);
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
    const asset = await assetService.createAsset(req.body, req.user.id);
    res.status(201).json(asset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// UPDATE asset
exports.updateAsset = async (req, res) => {
  try {
    const asset = await assetService.updateAsset(req.params.id, req.body, req.user.id);
    res.json(asset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE asset
exports.deleteAsset = async (req, res) => {
  try {
    await assetService.deleteAsset(req.params.id);
    res.json({ message: 'Asset deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};