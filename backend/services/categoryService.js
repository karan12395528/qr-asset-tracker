const pool = require('../config/db');

// GET all categories for a company
exports.getCategories = async (companyId) => {
  const [rows] = await pool.query(
    'SELECT * FROM categories WHERE company_id = ? ORDER BY name ASC',
    [companyId]
  );
  return rows;
};

// CREATE category (admin only)
exports.createCategory = async (name, companyId) => {
  if (!name) throw new Error('Category name required');

  const [existing] = await pool.query(
    'SELECT id FROM categories WHERE name = ? AND company_id = ?',
    [name.trim(), companyId]
  );
  if (existing.length > 0) throw new Error('Category already exists');

  const [result] = await pool.query(
    'INSERT INTO categories (company_id, name) VALUES (?, ?)',
    [companyId, name.trim()]
  );
  const [cat] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
  return cat[0];
};

// DELETE category (admin only)
exports.deleteCategory = async (id, companyId) => {
  const [result] = await pool.query(
    'DELETE FROM categories WHERE id = ? AND company_id = ?',
    [id, companyId]
  );
  return result.affectedRows > 0;
};
