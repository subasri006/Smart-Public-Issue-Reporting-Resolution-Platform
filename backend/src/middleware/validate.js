const { ApiResponse } = require('../utils/apiResponse');

const validate = (schema) => {
  return async (req, res, next) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const firstError = error.errors[0];
        const field = firstError.path.join('.');
        const message = `${field ? field + ': ' : ''}${firstError.message}`;
        return res.status(400).json(ApiResponse.error(message));
      }
      return res.status(400).json(ApiResponse.error(error.message || 'Validation error'));
    }
  };
};

module.exports = validate;
