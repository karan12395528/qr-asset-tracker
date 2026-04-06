const express = require('express');
const pool = require('../config/db');
const { verifyToken } = require('./middleware');
const router = express.Router();

// POST - Check out an asset
router.post('/checkout', verifyToken, async (req, res) => {
  try {
    const { tag, notes } = req.body;
    if (!tag) return res.status(400).json({ error: 'Asset tag required' });

    const [assets] = await pool.query('SELECT * FROM assets WHERE tag = ?', [tag]);
    if (assets.length === 0) return res.status(404).json({ error: 'Asset not found' });

    const asset = assets[0];
    if (asset.status === 'checked-out')
      return res.status(400).json({ error: 'Asset is already checked out' });

    // Update asset status
    await pool.query('UPDATE assets SET status = ? WHERE id = ?', ['checked-out', asset.id]);

    // Create checkout record
    await pool.query(
      'INSERT INTO checkouts (asset_id, user_id, notes) VALUES (?, ?, ?)',
      [asset.id, req.user.id, notes || '']
    );

    // Log action
    await pool.query(
      'INSERT INTO audit_log (asset_id, action, performed_by, details) VALUES (?, ?, ?, ?)',
      [asset.id, 'CHECKOUT', req.user.id, `Asset checked out by ${req.user.name}`]
    );

    res.json({ message: 'Asset checked out successfully', asset: { ...asset, status: 'checked-out' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST - Return an asset
router.post('/return', verifyToken, async (req, res) => {
  try {
    const { tag, notes } = req.body;
    if (!tag) return res.status(400).json({ error: 'Asset tag required' });

    const [assets] = await pool.query('SELECT * FROM assets WHERE tag = ?', [tag]);
    if (assets.length === 0) return res.status(404).json({ error: 'Asset not found' });

    const asset = assets[0];
    if (asset.status === 'available')
      return res.status(400).json({ error: 'Asset is already available' });

    // Update asset status
    await pool.query('UPDATE assets SET status = ? WHERE id = ?', ['available', asset.id]);

    // Update checkout record with return time
    await pool.query(
      'UPDATE checkouts SET return_time = NOW(), notes = CONCAT(IFNULL(notes,""), ?) WHERE asset_id = ? AND return_time IS NULL',
      [notes ? ` | Return note: ${notes}` : '', asset.id]
    );

    // Log action
    await pool.query(
      'INSERT INTO audit_log (asset_id, action, performed_by, details) VALUES (?, ?, ?, ?)',
      [asset.id, 'RETURN', req.user.id, `Asset returned by ${req.user.name}`]
    );

    res.json({ message: 'Asset returned successfully', asset: { ...asset, status: 'available' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET - Active checkouts
router.get('/active', verifyToken, async (req, res) => {
  try {
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
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
