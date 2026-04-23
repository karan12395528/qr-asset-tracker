const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const categoryController = require('../controllers/categoryController');

router.get('/', verifyToken, categoryController.getCategories);           // All roles
router.post('/', verifyAdmin, categoryController.createCategory);          // Admin only
router.delete('/:id', verifyAdmin, categoryController.deleteCategory);     // Admin only

module.exports = router;
