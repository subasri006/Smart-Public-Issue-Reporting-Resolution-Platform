const express = require('express');
const categoryController = require('../controllers/categoryController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { categorySchema } = require('../validators/categoryValidator');

const router = express.Router();

router.get('/', (req, res, next) => categoryController.getAllCategories(req, res, next));
router.get('/:id', (req, res, next) => categoryController.getCategoryById(req, res, next));

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(categorySchema),
  (req, res, next) => categoryController.createCategory(req, res, next)
);

router.put('/:id', authenticate, authorize('ADMIN'), (req, res, next) =>
  categoryController.updateCategory(req, res, next)
);

router.delete('/:id', authenticate, authorize('ADMIN'), (req, res, next) =>
  categoryController.deleteCategory(req, res, next)
);

module.exports = router;
