const authService = require('../services/authService');

// REGISTER (New Client Signup -> Creates Company & Admin User)
exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    if (err.message === 'All fields required') return res.status(400).json({ error: err.message });
    if (err.message === 'Email already registered') return res.status(409).json({ error: err.message });
    res.status(500).json({ error: 'Server error' });
  }
};

// CREATE STAFF (Admin Only -> Adds user to their company)
exports.createStaff = async (req, res) => {
  try {
    const result = await authService.createStaff(req.body, req.user);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    if (err.message === 'All fields required') return res.status(400).json({ error: err.message });
    if (err.message === 'Email already registered') return res.status(409).json({ error: err.message });
    res.status(500).json({ error: 'Server error' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    if (err.message === 'Email and password required' || err.message === 'Invalid credentials') {
      return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
};