const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// REGISTER
exports.register = async ({ name, email, password, role }) => {
  if (!name || !email || !password)
    throw new Error('All fields required');

  const [existing] = await pool.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existing.length > 0)
    throw new Error('Email already registered');

  const hashed = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashed, role || 'staff']
  );

  const user = {
    id: result.insertId,
    name,
    email,
    role: role || 'staff',
  };

  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return { token, user };
};

// LOGIN
exports.login = async ({ email, password }) => {
  if (!email || !password)
    throw new Error('Email and password required');

  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (rows.length === 0)
    throw new Error('Invalid credentials');

  const user = rows[0];

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    throw new Error('Invalid credentials');

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(userData, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return { token, user: userData };
};