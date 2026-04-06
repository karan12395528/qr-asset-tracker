const express = require('express');
const QRCode = require('qrcode');
const pool = require('../config/db');
const { verifyToken } = require('./middleware');
const router = express.Router();

// GET QR code for an asset tag
router.get('/:tag', verifyToken, async (req, res) => {
  try {
    const { tag } = req.params;

    // Verify asset exists
    const [rows] = await pool.query('SELECT * FROM assets WHERE tag = ?', [tag]);
    if (rows.length === 0) return res.status(404).json({ error: 'Asset not found' });

    // Generate QR code as data URL (base64 PNG)
    const qrData = JSON.stringify({ tag, name: rows[0].name, id: rows[0].id });
    const qrImage = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' }
    });

    res.json({ tag, qr: qrImage, asset: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
