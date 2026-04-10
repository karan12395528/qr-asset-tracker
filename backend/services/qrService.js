const QRCode = require('qrcode');
const pool = require('../config/db');

exports.generateQRCode = async (tag) => {
  const [rows] = await pool.query(
    'SELECT * FROM assets WHERE tag = ?',
    [tag]
  );

  if (rows.length === 0)
    throw new Error('Asset not found');

  const asset = rows[0];

  const qrData = JSON.stringify({
    tag,
    name: asset.name,
    id: asset.id,
  });

  const qrImage = await QRCode.toDataURL(qrData, {
    errorCorrectionLevel: 'H',
    width: 300,
    margin: 2,
    color: { dark: '#0f172a', light: '#ffffff' },
  });

  return {
    tag,
    qr: qrImage,
    asset,
  };
};