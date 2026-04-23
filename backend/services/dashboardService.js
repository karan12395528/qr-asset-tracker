const pool = require('../config/db');

// STATS
exports.getStats = async (user) => {
  const companyId = user.company_id;

  const [[totalAssets]] = await pool.query(
    'SELECT COUNT(*) as count FROM assets WHERE company_id = ?', [companyId]
  );

  const [[available]] = await pool.query(
    "SELECT COUNT(*) as count FROM assets WHERE status = 'available' AND company_id = ?", [companyId]
  );

  const [[checkedOut]] = await pool.query(
    "SELECT COUNT(*) as count FROM assets WHERE status = 'checked-out' AND company_id = ?", [companyId]
  );

  const [[totalUsers]] = await pool.query(
    'SELECT COUNT(*) as count FROM users WHERE company_id = ?', [companyId]
  );

  // New Category logic: Join with categories table
  const [categories] = await pool.query(`
    SELECT c.name as category, COUNT(a.id) as count 
    FROM categories c 
    LEFT JOIN assets a ON a.category_id = c.id 
    WHERE c.company_id = ? 
    GROUP BY c.id, c.name
  `, [companyId]);

  // Recent activity - Staff see only their own, Admins see company-wide
  let activityQuery = `
    SELECT al.action, al.details, al.timestamp,
           a.name AS asset_name, a.tag,
           u.name AS performed_by
    FROM audit_log al
    LEFT JOIN assets a ON al.asset_id = a.id
    LEFT JOIN users u ON al.performed_by = u.id
    WHERE al.company_id = ?
  `;
  const activityParams = [companyId];

  if (user.role === 'staff') {
    activityQuery += ' AND al.performed_by = ?';
    activityParams.push(user.id);
  }

  activityQuery += ' ORDER BY al.timestamp DESC LIMIT 10';

  const [recentActivity] = await pool.query(activityQuery, activityParams);

  return {
    totalAssets: totalAssets.count,
    available: available.count,
    checkedOut: checkedOut.count,
    totalUsers: totalUsers.count,
    categories,
    recentActivity,
  };
};

// AUDIT LOG - Staff see only their own, Admins see company-wide
exports.getAuditLog = async ({ asset_id, from, to }, user) => {
  const companyId = user.company_id;
  
  let query = `
    SELECT al.id, al.action, al.details, al.timestamp,
           a.name AS asset_name, a.tag,
           u.name AS performed_by
    FROM audit_log al
    LEFT JOIN assets a ON al.asset_id = a.id
    LEFT JOIN users u ON al.performed_by = u.id
    WHERE al.company_id = ?
  `;
  const params = [companyId];

  if (user.role === 'staff') {
    query += ' AND al.performed_by = ?';
    params.push(user.id);
  }

  if (asset_id) {
    query += ' AND al.asset_id = ?';
    params.push(asset_id);
  }
  if (from) {
    query += ' AND al.timestamp >= ?';
    params.push(from);
  }
  if (to) {
    query += ' AND al.timestamp <= ?';
    params.push(to);
  }

  query += ' ORDER BY al.timestamp DESC LIMIT 100';

  const [rows] = await pool.query(query, params);
  return rows;
};