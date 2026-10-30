const { ApiResponse } = require('../utils/apiResponse');

class HealthController {
  healthCheck(req, res) {
    return res.status(200).json(
      ApiResponse.ok('Service is healthy', {
        status: 'UP',
        service: 'CivicFix Backend (MERN)',
        timestamp: new Date().toISOString(),
      })
    );
  }
}

module.exports = new HealthController();
