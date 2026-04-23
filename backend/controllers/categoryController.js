const categoryService = require('../services/categoryService');

exports.getCategories = async (req, res) => {
  try {
    let companyId = req.user.company_id;
    if (req.user.role === 'superadmin' && req.query.targetCompanyId) {
      companyId = req.query.targetCompanyId;
    }
    const cats = await categoryService.getCategories(companyId);
    res.json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const cat = await categoryService.createCategory(req.body.name, req.user.company_id);
    res.status(201).json(cat);
  } catch (err) {
    console.error(err);
    if (err.message === 'Category name required' || err.message === 'Category already exists')
      return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await categoryService.deleteCategory(req.params.id, req.user.company_id);
    if (!deleted) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
