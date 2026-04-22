const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// REGISTER (New Client Signup)
exports.register = async ({ companyName, name, email, password }) => {
  if (!companyName || !name || !email || !password)
    throw new Error('All fields required');

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) throw new Error('Email already registered');

  const companyId = uuidv4();
  const hashed = await bcrypt.hash(password, 10);

  await pool.query('INSERT INTO companies (id, name) VALUES (?, ?)', [companyId, companyName]);

  const [result] = await pool.query(
    'INSERT INTO users (company_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
    [companyId, name, email, hashed, 'admin']
  );

  const user = {
    id: result.insertId,
    company_id: companyId,
    name,
    email,
    role: 'admin',
  };

  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  return { token, user };
};

// CREATE STAFF
exports.createStaff = async ({ name, email, password, role }, adminUser) => {
  if (!name || !email || !password)
    throw new Error('All fields required');

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) throw new Error('Email already registered');

  const hashed = await bcrypt.hash(password, 10);
  const staffRole = role === 'admin' ? 'admin' : 'staff';

  const [result] = await pool.query(
    'INSERT INTO users (company_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
    [adminUser.company_id, name, email, hashed, staffRole]
  );

  return { 
    id: result.insertId, 
    company_id: adminUser.company_id,
    name, 
    email, 
    role: staffRole 
  };
};

// LOGIN
exports.login = async ({ email, password }) => {
  if (!email || !password) throw new Error('Email and password required');

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) throw new Error('Invalid credentials');

  const user = rows[0];

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid credentials');

  const userData = {
    id: user.id,
    company_id: user.company_id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  return { token, user: userData };
};