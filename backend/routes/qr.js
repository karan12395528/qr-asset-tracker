const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/authMiddleware');
const qrController = require('../controllers/qrController');

router.get('/:tag', verifyToken, qrController.getQRCode);

module.exports = router;