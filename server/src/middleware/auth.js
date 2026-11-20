/**
 * AUTHENTICATION MIDDLEWARE
 * Verifies JWT from HTTP-only cookie or Authorization header
 */

const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_development_secret_key_123';

async function authenticateAdmin(req, res, next) {
  try {
    let token = null;

    // 1. Try reading from signed/unsigned cookies
    if (req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }
    // 2. Try reading from Authorization Bearer header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Admin authentication required.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Admin user no longer exists.'
      });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token.'
    });
  }
}

module.exports = {
  authenticateAdmin,
  JWT_SECRET
};
