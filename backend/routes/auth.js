const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

router.post('/register', authController.register);  // Public, registers new client (company + admin)
router.post('/login', authController.login);        // Public, logs in ANY user

// Protected admin endpoint to add staff to their company
router.post('/staff', verifyAdmin, authController.createStaff);

module.exports = router;