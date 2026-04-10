const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// GET all assets
exports.getAllAssets = async ({ status, category, search }) => {
  let query = 'SELECT * FROM assets WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (name LIKE ? OR tag LIKE ? OR location LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC';

  const [rows] = await pool.query(query, params);
  return rows;
};

// GET asset
exports.getAssetByIdentifier = async (identifier) => {
  const [rows] = await pool.query(
    'SELECT * FROM assets WHERE tag = ? OR id = ?',
    [identifier, identifier]
  );
  return rows[0];
};

// CREATE asset
exports.createAsset = async (data, userId) => {
  const { name, category, location, description } = data;

  if (!name) throw new Error('Asset name required');

  const tag = 'ASSET-' + uuidv4().split('-')[0].toUpperCase();

  const [result] = await pool.query(
    'INSERT INTO assets (name, tag, category, location, description) VALUES (?, ?, ?, ?, ?)',
    [name, tag, category || 'General', location || 'Main Office', description || '']
  );

  await pool.query(
    'INSERT INTO audit_log (asset_id, action, performed_by, details) VALUES (?, ?, ?, ?)',
    [result.insertId, 'ASSET_CREATED', userId, `Asset "${name}" created with tag ${tag}`]
  );

  const [asset] = await pool.query('SELECT * FROM assets WHERE id = ?', [result.insertId]);
  return asset[0];
};

// UPDATE asset
exports.updateAsset = async (id, data, userId) => {
  const { name, category, location, description } = data;

  await pool.query(
    'UPDATE assets SET name = ?, category = ?, location = ?, description = ? WHERE id = ?',
    [name, category, location, description, id]
  );

  await pool.query(
    'INSERT INTO audit_log (asset_id, action, performed_by, details) VALUES (?, ?, ?, ?)',
    [id, 'ASSET_UPDATED', userId, 'Asset updated']
  );

  const [asset] = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
  return asset[0];
};

// DELETE asset
exports.deleteAsset = async (id) => {
  await pool.query('DELETE FROM assets WHERE id = ?', [id]);
};