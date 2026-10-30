const { ApiResponse } = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  return res.status(404).json(ApiResponse.error(`Endpoint not found: ${req.method} ${req.originalUrl}`));
};

module.exports = notFound;
