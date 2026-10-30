const express = require('express');
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createUserSchema, updateUserSchema } = require('../validators/userValidator');

const router = express.Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/users', (req, res, next) => adminController.getUsers(req, res, next));
router.get('/users/:id', (req, res, next) => adminController.getUserById(req, res, next));
router.post('/users', validate(createUserSchema), (req, res, next) =>
  adminController.createUser(req, res, next)
);
router.put('/users/:id', validate(updateUserSchema), (req, res, next) =>
  adminController.updateUser(req, res, next)
);

router.get('/audit-logs', (req, res, next) => adminController.getAuditLogs(req, res, next));

module.exports = router;
