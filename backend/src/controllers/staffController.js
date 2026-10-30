const userService = require('../services/userService');
const { ApiResponse } = require('../utils/apiResponse');

class StaffController {
  async getStaffList(req, res, next) {
    try {
      const response = await userService.getStaffMembers();
      return res.status(200).json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StaffController();
