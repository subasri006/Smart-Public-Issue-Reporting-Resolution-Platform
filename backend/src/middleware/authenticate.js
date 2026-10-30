const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(ApiResponse.error('Full authentication is required to access this resource'));
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return res.status(401).json(ApiResponse.error('Full authentication is required to access this resource'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json(ApiResponse.error('Unauthorized: Invalid or expired token'));
    }

    const user = await User.findById(decoded.id || decoded.sub);
    if (!user || !user.active) {
      return res.status(401).json(ApiResponse.error('User account is inactive or no longer exists'));
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    return res.status(500).json(ApiResponse.error('Authentication error occurred: ' + error.message));
  }
};

module.exports = authenticate;
