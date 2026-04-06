const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const { verifyToken } = require('./middleware');
const router = express.Router();

// GET all assets
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let query = 'SELECT * FROM assets WHERE 1=1';
    const params = [];

    if (status) { query += ' AND status = ?'; params.push(status); }
    if (category) { query += ' AND category = ?'; params.push(category); }
    if (search) { query += ' AND (name LIKE ? OR tag LIKE ? OR location LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single asset by tag or id
router.get('/:identifier', verifyToken, async (req, res) => {
  try {
    const { identifier } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM assets WHERE tag = ? OR id = ?',
      [identifier, identifier]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Asset not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create asset
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, category, location, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Asset name required' });

    const tag = 'ASSET-' + uuidv4().split('-')[0].toUpperCase();
    const [result] = await pool.query(
      'INSERT INTO assets (name, tag, category, location, description) VALUES (?, ?, ?, ?, ?)',
      [name, tag, category || 'General', location || 'Main Office', description || '']
    );

    await pool.query(
      'INSERT INTO audit_log (asset_id, action, performed_by, details) VALUES (?, ?, ?, ?)',
      [result.insertId, 'ASSET_CREATED', req.user.id, `Asset "${name}" created with tag ${tag}`]
    );

    const [asset] = await pool.query('SELECT * FROM assets WHERE id = ?', [result.insertId]);
    res.status(201).json(asset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update asset
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, category, location, description } = req.body;
    const { id } = req.params;

    await pool.query(
      'UPDATE assets SET name = ?, category = ?, location = ?, description = ? WHERE id = ?',
      [name, category, location, description, id]
    );

    await pool.query(
      'INSERT INTO audit_log (asset_id, action, performed_by, details) VALUES (?, ?, ?, ?)',
      [id, 'ASSET_UPDATED', req.user.id, `Asset updated`]
    );

    const [asset] = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
    res.json(asset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE asset
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM assets WHERE id = ?', [id]);
    res.json({ message: 'Asset deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
