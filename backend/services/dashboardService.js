const pool = require('../config/db');

// STATS
exports.getStats = async (companyId) => {
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

  const [categories] = await pool.query(
    'SELECT category, COUNT(*) as count FROM assets WHERE company_id = ? GROUP BY category', [companyId]
  );

  const [recentActivity] = await pool.query(`
    SELECT al.action, al.details, al.timestamp,
           a.name AS asset_name, a.tag,
           u.name AS performed_by
    FROM audit_log al
    LEFT JOIN assets a ON al.asset_id = a.id
    LEFT JOIN users u ON al.performed_by = u.id
    WHERE al.company_id = ?
    ORDER BY al.timestamp DESC
    LIMIT 10
  `, [companyId]);

  return {
    totalAssets: totalAssets.count,
    available: available.count,
    checkedOut: checkedOut.count,
    totalUsers: totalUsers.count,
    categories,
    recentActivity,
  };
};

// AUDIT LOG
exports.getAuditLog = async ({ asset_id, from, to }, companyId) => {
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