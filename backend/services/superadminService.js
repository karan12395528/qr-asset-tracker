const pool = require('../config/db');

// GET Global Overview (SuperAdmin only)
exports.getGlobalStats = async () => {
  const [[companies]] = await pool.query('SELECT COUNT(*) as count FROM companies');
  const [[users]] = await pool.query('SELECT COUNT(*) as count FROM users');
  const [[assets]] = await pool.query('SELECT COUNT(*) as count FROM assets');
  const [[checkouts]] = await pool.query('SELECT COUNT(*) as count FROM checkouts');

  const [companyList] = await pool.query(`
    SELECT c.id, c.name, c.created_at,
           (SELECT COUNT(*) FROM users WHERE company_id = c.id) as userCount,
           (SELECT COUNT(*) FROM assets WHERE company_id = c.id) as assetCount
    FROM companies c
    ORDER BY c.created_at DESC
  `);

  return {
    stats: {
      totalCompanies: companies.count,
      totalUsers: users.count,
      totalAssets: assets.count,
      totalCheckouts: checkouts.count
    },
    companies: companyList
  };
};
