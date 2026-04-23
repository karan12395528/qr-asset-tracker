const jwt = require('jsonwebtoken');

// Verify JWT token — attaches req.user
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Admin or SuperAdmin only
function verifyAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
      next();
    } else {
      res.status(403).json({ error: 'Admin access required' });
    }
  });
}

// SuperAdmin only (set manually in DB, no UI)
function verifySuperAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'superadmin') {
      next();
    } else {
      res.status(403).json({ error: 'SuperAdmin access required' });
    }
  });
}

module.exports = { verifyToken, verifyAdmin, verifySuperAdmin };
