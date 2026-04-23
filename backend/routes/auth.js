const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

router.post('/register', authController.register);         // Public: creates new company + admin
router.post('/login', authController.login);               // Public: login any user
router.post('/staff', verifyAdmin, authController.createStaff);   // Admin: add staff to company
router.get('/users', verifyAdmin, authController.getCompanyUsers); // Admin: list company users

module.exports = router;