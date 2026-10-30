const { ApiResponse } = require('../utils/apiResponse');

// Centralized Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const key = Object.keys(err.keyValue || {})[0];
    const val = err.keyValue ? err.keyValue[key] : '';
    message = `${key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Value'} '${val}' is already registered or in use`;
  }

  // Mongoose invalid ObjectId CastError
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = `Resource not found with id: ${err.value}`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const firstKey = Object.keys(err.errors || {})[0];
    message = firstKey ? err.errors[firstKey].message : 'Validation failed';
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size exceeds maximum allowed limit (5MB)';
  }

  if (process.env.NODE_ENV !== 'test' && statusCode === 500) {
    console.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, err);
  }

  return res.status(statusCode).json(ApiResponse.error(message));
};

module.exports = errorHandler;
