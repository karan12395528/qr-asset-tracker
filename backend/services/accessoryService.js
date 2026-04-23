const pool = require('../config/db');

// GET accessories for an asset
exports.getAccessories = async (assetId, companyId) => {
  const [rows] = await pool.query(
    'SELECT * FROM accessories WHERE asset_id = ? AND company_id = ?',
    [assetId, companyId]
  );
  return rows;
};

// ADD accessory (admin only)
exports.addAccessory = async ({ assetId, name, quantity }, companyId) => {
  if (!assetId || !name) throw new Error('Asset ID and name required');
  
  const [result] = await pool.query(
    'INSERT INTO accessories (asset_id, company_id, name, quantity) VALUES (?, ?, ?, ?)',
    [assetId, companyId, name.trim(), quantity || 1]
  );
  
  const [row] = await pool.query('SELECT * FROM accessories WHERE id = ?', [result.insertId]);
  return row[0];
};

// DELETE accessory (admin only)
exports.deleteAccessory = async (id, companyId) => {
  const [result] = await pool.query(
    'DELETE FROM accessories WHERE id = ? AND company_id = ?',
    [id, companyId]
  );
  return result.affectedRows > 0;
};
