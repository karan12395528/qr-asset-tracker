const express = require('express');
const pool = require('../config/db');
const { verifyToken } = require('./middleware');
const router = express.Router();

// GET dashboard stats
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const [[totalAssets]] = await pool.query('SELECT COUNT(*) as count FROM assets');
    const [[available]] = await pool.query("SELECT COUNT(*) as count FROM assets WHERE status = 'available'");
    const [[checkedOut]] = await pool.query("SELECT COUNT(*) as count FROM assets WHERE status = 'checked-out'");
    const [[totalUsers]] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [categories] = await pool.query('SELECT category, COUNT(*) as count FROM assets GROUP BY category');

    const [recentActivity] = await pool.query(`
      SELECT al.action, al.details, al.timestamp,
             a.name AS asset_name, a.tag,
             u.name AS performed_by
      FROM audit_log al
      LEFT JOIN assets a ON al.asset_id = a.id
      LEFT JOIN users u ON al.performed_by = u.id
      ORDER BY al.timestamp DESC
      LIMIT 10
    `);

    res.json({
      totalAssets: totalAssets.count,
      available: available.count,
      checkedOut: checkedOut.count,
      totalUsers: totalUsers.count,
      categories,
      recentActivity
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET full audit log
router.get('/audit', verifyToken, async (req, res) => {
  try {
    const { asset_id, from, to } = req.query;
    let query = `
      SELECT al.id, al.action, al.details, al.timestamp,
             a.name AS asset_name, a.tag,
             u.name AS performed_by
      FROM audit_log al
      LEFT JOIN assets a ON al.asset_id = a.id
      LEFT JOIN users u ON al.performed_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (asset_id) { query += ' AND al.asset_id = ?'; params.push(asset_id); }
    if (from) { query += ' AND al.timestamp >= ?'; params.push(from); }
    if (to) { query += ' AND al.timestamp <= ?'; params.push(to); }

    query += ' ORDER BY al.timestamp DESC LIMIT 100';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
