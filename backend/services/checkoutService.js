const pool = require('../config/db');

// CHECKOUT
exports.checkoutAsset = async ({ tag, notes }, user) => {
  if (!tag) throw new Error('Asset tag required');

  const [assets] = await pool.query(
    'SELECT * FROM assets WHERE tag = ?',
    [tag]
  );

  if (assets.length === 0) throw new Error('Asset not found');

  const asset = assets[0];

  if (asset.status === 'checked-out')
    throw new Error('Asset is already checked out');

  await pool.query(
    'UPDATE assets SET status = ? WHERE id = ?',
    ['checked-out', asset.id]
  );

  await pool.query(
    'INSERT INTO checkouts (asset_id, user_id, notes) VALUES (?, ?, ?)',
    [asset.id, user.id, notes || '']
  );

  await pool.query(
    'INSERT INTO audit_log (asset_id, action, performed_by, details) VALUES (?, ?, ?, ?)',
    [
      asset.id,
      'CHECKOUT',
      user.id,
      `Asset checked out by ${user.name}`,
    ]
  );

  return {
    message: 'Asset checked out successfully',
    asset: { ...asset, status: 'checked-out' },
  };
};

// RETURN
exports.returnAsset = async ({ tag, notes }, user) => {
  if (!tag) throw new Error('Asset tag required');

  const [assets] = await pool.query(
    'SELECT * FROM assets WHERE tag = ?',
    [tag]
  );

  if (assets.length === 0) throw new Error('Asset not found');

  const asset = assets[0];

  if (asset.status === 'available')
    throw new Error('Asset is already available');

  await pool.query(
    'UPDATE assets SET status = ? WHERE id = ?',
    ['available', asset.id]
  );

  await pool.query(
    `UPDATE checkouts 
     SET return_time = NOW(), 
         notes = CONCAT(IFNULL(notes,""), ?) 
     WHERE asset_id = ? AND return_time IS NULL`,
    [notes ? ` | Return note: ${notes}` : '', asset.id]
  );

  await pool.query(
    'INSERT INTO audit_log (asset_id, action, performed_by, details) VALUES (?, ?, ?, ?)',
    [
      asset.id,
      'RETURN',
      user.id,
      `Asset returned by ${user.name}`,
    ]
  );

  return {
    message: 'Asset returned successfully',
    asset: { ...asset, status: 'available' },
  };
};

// ACTIVE CHECKOUTS
exports.getActiveCheckouts = async () => {
  const [rows] = await pool.query(`
    SELECT c.id, c.checkout_time, c.notes,
           a.name AS asset_name, a.tag, a.category, a.location,
           u.name AS checked_out_by, u.email
    FROM checkouts c
    JOIN assets a ON c.asset_id = a.id
    JOIN users u ON c.user_id = u.id
    WHERE c.return_time IS NULL
    ORDER BY c.checkout_time DESC
  `);

  return rows;
};