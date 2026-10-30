const analyticsService = require('../services/analyticsService');
const { ApiResponse } = require('../utils/apiResponse');

class AnalyticsController {
  async getSummary(req, res, next) {
    try {
      const response = await analyticsService.getSummary();
      return res.status(200).json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }

  async getCategoryStats(req, res, next) {
    try {
      const response = await analyticsService.getCategoryStats();
      return res.status(200).json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }

  async getStatusStats(req, res, next) {
    try {
      const response = await analyticsService.getStatusStats();
      return res.status(200).json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }

  async getTrends(req, res, next) {
    try {
      const days = req.query.days ? parseInt(req.query.days, 10) : 14;
      const response = await analyticsService.getTrends(days);
      return res.status(200).json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }

  async getAreaStats(req, res, next) {
    try {
      const response = await analyticsService.getAreaStats();
      return res.status(200).json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }

  async exportCsv(req, res, next) {
    try {
      const csvBuffer = await analyticsService.exportComplaintsCsv();

      res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="civicfix_complaints_report.csv"'
      );

      return res.status(200).send(csvBuffer);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnalyticsController();
