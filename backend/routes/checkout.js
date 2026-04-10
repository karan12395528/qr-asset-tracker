const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/authMiddleware');
const checkoutController = require('../controllers/checkoutController');

router.post('/checkout', verifyToken, checkoutController.checkoutAsset);
router.post('/return', verifyToken, checkoutController.returnAsset);
router.get('/active', verifyToken, checkoutController.getActiveCheckouts);

module.exports = router;