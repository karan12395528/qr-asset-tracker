const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const qrRoutes = require('./routes/qr');
const checkoutRoutes = require('./routes/checkout');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'QR Asset Tracker API is running' });
});

module.exports = app;