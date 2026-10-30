const userService = require('../services/userService');
const auditService = require('../services/auditService');
const { ApiResponse } = require('../utils/apiResponse');

class AdminController {
  async getUsers(req, res, next) {
    try {
      const { role, search, page = 0, size = 15 } = req.query;
      const response = await userService.getUsers(role, search, page, size);
      return res.status(200).json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req, res, next) {
    try {
      const response = await userService.getUserById(req.params.id);
      return res.status(200).json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }

  async createUser(req, res, next) {
    try {
      const response = await userService.createUser(req.body, req.user);
      return res.status(200).json(ApiResponse.ok('User created successfully', response));
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req, res, next) {
    try {
      const response = await userService.updateUser(req.params.id, req.body, req.user);
      return res.status(200).json(ApiResponse.ok('User updated successfully', response));
    } catch (err) {
      next(err);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const { page = 0, size = 20 } = req.query;
      const response = await auditService.getLogs(page, size);
      return res.status(200).json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
