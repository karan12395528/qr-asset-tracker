const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// GET all assets - Joined with categories to get names
exports.getAllAssets = async ({ status, categoryId, search }, companyId) => {
  let query = `
    SELECT a.*, c.name as category_name 
    FROM assets a 
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.company_id = ?
  `;
  const params = [companyId];

  if (status) {
    query += ' AND a.status = ?';
    params.push(status);
  }
  if (categoryId) {
    query += ' AND a.category_id = ?';
    params.push(categoryId);
  }
  if (search) {
    query += ' AND (a.name LIKE ? OR a.tag LIKE ? OR a.location LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY a.created_at DESC';

  const [rows] = await pool.query(query, params);
  return rows;
};

// GET asset
exports.getAssetByIdentifier = async (identifier, companyId) => {
  const [rows] = await pool.query(
    `SELECT a.*, c.name as category_name 
     FROM assets a 
     LEFT JOIN categories c ON a.category_id = c.id
     WHERE (a.tag = ? OR a.id = ?) AND a.company_id = ?`,
    [identifier, identifier, companyId]
  );
  return rows[0];
};

// CREATE asset
exports.createAsset = async (data, user) => {
  const { name, category_id, location, description } = data;

  if (!name) throw new Error('Asset name required');

  const tag = 'ASSET-' + uuidv4().split('-')[0].toUpperCase();

  const [result] = await pool.query(
    'INSERT INTO assets (company_id, name, tag, category_id, location, description) VALUES (?, ?, ?, ?, ?, ?)',
    [user.company_id, name, tag, category_id || null, location || 'Main Office', description || '']
  );

  await pool.query(
    'INSERT INTO audit_log (company_id, asset_id, action, performed_by, details) VALUES (?, ?, ?, ?, ?)',
    [user.company_id, result.insertId, 'ASSET_CREATED', user.id, `Asset "${name}" created with tag ${tag}`]
  );

  const [asset] = await pool.query('SELECT * FROM assets WHERE id = ?', [result.insertId]);
  return asset[0];
};

// UPDATE asset
exports.updateAsset = async (id, data, user) => {
  const { name, category_id, location, description } = data;

  const [updateResult] = await pool.query(
    'UPDATE assets SET name = ?, category_id = ?, location = ?, description = ? WHERE id = ? AND company_id = ?',
    [name, category_id, location, description, id, user.company_id]
  );

  if (updateResult.affectedRows === 0) return null;

  await pool.query(
    'INSERT INTO audit_log (company_id, asset_id, action, performed_by, details) VALUES (?, ?, ?, ?, ?)',
    [user.company_id, id, 'ASSET_UPDATED', user.id, 'Asset updated']
  );

  const [asset] = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
  return asset[0];
};

// DELETE asset
exports.deleteAsset = async (id, companyId) => {
  const [result] = await pool.query('DELETE FROM assets WHERE id = ? AND company_id = ?', [id, companyId]);
  return result.affectedRows > 0;
};