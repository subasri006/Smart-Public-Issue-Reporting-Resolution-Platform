const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.get('/summary', (req, res, next) => analyticsController.getSummary(req, res, next));
router.get('/categories', (req, res, next) =>
  analyticsController.getCategoryStats(req, res, next)
);
router.get('/status', (req, res, next) =>
  analyticsController.getStatusStats(req, res, next)
);
router.get('/trends', (req, res, next) => analyticsController.getTrends(req, res, next));
router.get('/areas', (req, res, next) => analyticsController.getAreaStats(req, res, next));

router.get('/export', authenticate, authorize('STAFF', 'ADMIN'), (req, res, next) =>
  analyticsController.exportCsv(req, res, next)
);

module.exports = router;
