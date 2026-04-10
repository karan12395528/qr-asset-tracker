const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/authMiddleware');
const assetController = require('../controllers/assetController');

router.get('/', verifyToken, assetController.getAllAssets);
router.get('/:identifier', verifyToken, assetController.getAssetByIdentifier);
router.post('/', verifyToken, assetController.createAsset);
router.put('/:id', verifyToken, assetController.updateAsset);
router.delete('/:id', verifyToken, assetController.deleteAsset);

module.exports = router;