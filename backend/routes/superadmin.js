const express = require('express');
const router = express.Router();
const { verifySuperAdmin } = require('../middleware/authMiddleware');
const superadminController = require('../controllers/superadminController');

router.get('/overview', verifySuperAdmin, superadminController.getOverview);

module.exports = router;
