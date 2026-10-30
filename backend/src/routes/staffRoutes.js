const express = require('express');
const staffController = require('../controllers/staffController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(authenticate, authorize('STAFF', 'ADMIN'));

router.get('/list', (req, res, next) => staffController.getStaffList(req, res, next));

module.exports = router;
