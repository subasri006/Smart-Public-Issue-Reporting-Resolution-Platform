const { ApiResponse } = require('../utils/apiResponse');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('Authentication required'));
    }

    const normalizedRoles = roles.flatMap((r) => [r, `ROLE_${r.replace('ROLE_', '')}`]);
    const userRole = req.user.role;

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json(ApiResponse.error('Access is denied: insufficient role privileges'));
    }

    next();
  };
};

module.exports = authorize;
