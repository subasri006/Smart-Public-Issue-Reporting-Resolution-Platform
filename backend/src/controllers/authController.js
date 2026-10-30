const authService = require('../services/authService');
const { ApiResponse } = require('../utils/apiResponse');

class AuthController {
  async register(req, res, next) {
    try {
      const response = await authService.register(req.body);
      return res.status(200).json(ApiResponse.ok('Registration successful', response));
    } catch (err) {
      next(err);
    }
  }

  async registerCitizen(req, res, next) {
    try {
      const response = await authService.register(req.body);
      return res.status(200).json(ApiResponse.ok('Citizen registration successful', response));
    } catch (err) {
      next(err);
    }
  }

  async registerStaff(req, res, next) {
    try {
      const response = await authService.registerStaff(req.body);
      return res.status(200).json(ApiResponse.ok('Staff registration successful', response));
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const response = await authService.login(req.body);
      return res.status(200).json(ApiResponse.ok('Login successful', response));
    } catch (err) {
      next(err);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const response = await authService.getProfile(req.userId);
      return res.status(200).json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const response = await authService.updateProfile(req.userId, req.body);
      return res.status(200).json(ApiResponse.ok('Profile updated successfully', response));
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      await authService.changePassword(req.userId, req.body);
      return res.status(200).json(ApiResponse.ok('Password changed successfully', null));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
