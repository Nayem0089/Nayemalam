/**
 * RATE LIMITER MIDDLEWARE
 * Protects login and sensitive endpoints against brute force attacks
 */

const rateLimit = require('express-rate-limit');

// Strict rate limiter for Admin Login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please slow down.'
  }
});

module.exports = {
  loginLimiter,
  apiLimiter
};
