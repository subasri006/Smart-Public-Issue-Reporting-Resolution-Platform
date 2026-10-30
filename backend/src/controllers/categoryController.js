const categoryService = require('../services/categoryService');
const { ApiResponse } = require('../utils/apiResponse');

class CategoryController {
  async getAllCategories(req, res, next) {
    try {
      const onlyActive = req.query.onlyActive !== 'false';
      const response = await categoryService.getAllCategories(onlyActive);
      return res.status(200).json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const response = await categoryService.getCategoryById(req.params.id);
      return res.status(200).json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }

  async createCategory(req, res, next) {
    try {
      const response = await categoryService.createCategory(req.body, req.user);
      return res.status(200).json(ApiResponse.ok('Category created successfully', response));
    } catch (err) {
      next(err);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const response = await categoryService.updateCategory(req.params.id, req.body, req.user);
      return res.status(200).json(ApiResponse.ok('Category updated successfully', response));
    } catch (err) {
      next(err);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      await categoryService.deleteCategory(req.params.id, req.user);
      return res.status(200).json(ApiResponse.ok('Category deactivated successfully', null));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CategoryController();
