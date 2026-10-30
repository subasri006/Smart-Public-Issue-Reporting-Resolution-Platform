const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const {
  registerSchema,
  staffRegisterSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require('../validators/authValidator');

const router = express.Router();

router.post('/register', validate(registerSchema), (req, res, next) =>
  authController.register(req, res, next)
);

router.post('/register/citizen', validate(registerSchema), (req, res, next) =>
  authController.registerCitizen(req, res, next)
);

router.post('/register/staff', validate(staffRegisterSchema), (req, res, next) =>
  authController.registerStaff(req, res, next)
);

router.post('/register-staff', validate(staffRegisterSchema), (req, res, next) =>
  authController.registerStaff(req, res, next)
);

router.post('/login', validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
);

router.get('/me', authenticate, (req, res, next) =>
  authController.getCurrentUser(req, res, next)
);

router.put('/profile', authenticate, validate(updateProfileSchema), (req, res, next) =>
  authController.updateProfile(req, res, next)
);

router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  (req, res, next) => authController.changePassword(req, res, next)
);

module.exports = router;
