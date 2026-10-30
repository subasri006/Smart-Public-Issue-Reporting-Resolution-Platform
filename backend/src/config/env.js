const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicfix',
  JWT_SECRET: process.env.JWT_SECRET || 'CivicFixSuperSecretKeyForJwtTokenGeneration2026SecureStringWith256Bits',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads/complaints'),
  
  // Initial Admin credentials
  ADMIN_EMAIL: process.env.CIVICFIX_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'subasri04006@gmail.com',
  ADMIN_PASSWORD: process.env.CIVICFIX_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '',
  ADMIN_USERNAME: process.env.CIVICFIX_ADMIN_USERNAME || process.env.ADMIN_USERNAME || 'subasri04006@gmail.com',
  ADMIN_FULL_NAME: process.env.ADMIN_NAME || 'Chief Administrator',

  // Duplicate detection constants
  DUPLICATE_WINDOW_DAYS: parseInt(process.env.DUPLICATE_WINDOW_DAYS || '30', 10),
  DUPLICATE_THRESHOLD_PERCENTAGE: parseFloat(process.env.DUPLICATE_THRESHOLD_PERCENTAGE || '45.0'),

  // Priority scoring constants
  PRIORITY_AGE_WEIGHT_PER_DAY: parseFloat(process.env.PRIORITY_AGE_WEIGHT_PER_DAY || '2.0'),
  PRIORITY_MAX_AGE_WEIGHT: parseFloat(process.env.PRIORITY_MAX_AGE_WEIGHT || '30.0'),
};

module.exports = env;
