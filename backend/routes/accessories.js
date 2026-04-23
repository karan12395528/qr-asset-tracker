const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const accessoryController = require('../controllers/accessoryController');

router.get('/:assetId', verifyToken, accessoryController.getAccessories);
router.post('/', verifyAdmin, accessoryController.addAccessory);
router.delete('/:id', verifyAdmin, accessoryController.deleteAccessory);

module.exports = router;
