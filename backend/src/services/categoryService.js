const { ComplaintCategory } = require('../models');
const auditService = require('./auditService');

class CategoryService {
  async getAllCategories(onlyActive = true) {
    const filter = onlyActive ? { active: true } : {};
    const categories = await ComplaintCategory.find(filter).sort({ name: 1 }).lean();

    return categories.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      code: c.code,
      description: c.description,
      weight: c.weight,
      icon: c.icon,
      active: c.active,
      createdAt: c.createdAt,
    }));
  }

  async getCategoryById(id) {
    const category = await ComplaintCategory.findById(id).lean();
    if (!category) {
      const error = new Error(`Category not found with id: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    return {
      id: category._id.toString(),
      name: category.name,
      code: category.code,
      description: category.description,
      weight: category.weight,
      icon: category.icon,
      active: category.active,
      createdAt: category.createdAt,
    };
  }

  async createCategory(request, currentUser) {
    const name = request.name.trim();
    const code = request.code.trim().toUpperCase();

    const existingName = await ComplaintCategory.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
    if (existingName) {
      const error = new Error(`Category with name '${name}' already exists`);
      error.statusCode = 400;
      throw error;
    }

    const existingCode = await ComplaintCategory.findOne({
      code: { $regex: new RegExp(`^${code}$`, 'i') },
    });
    if (existingCode) {
      const error = new Error(`Category with code '${code}' already exists`);
      error.statusCode = 400;
      throw error;
    }

    const category = await ComplaintCategory.create({
      name,
      code,
      description: request.description || '',
      weight: request.weight !== undefined ? Number(request.weight) : 15,
      icon: request.icon || 'HelpCircle',
      active: request.active !== undefined ? Boolean(request.active) : true,
    });

    await auditService.log(
      'CATEGORY_CREATED',
      'ComplaintCategory',
      category._id.toString(),
      currentUser,
      `Created category: ${category.name}`
    );

    return {
      id: category._id.toString(),
      name: category.name,
      code: category.code,
      description: category.description,
      weight: category.weight,
      icon: category.icon,
      active: category.active,
      createdAt: category.createdAt,
    };
  }

  async updateCategory(id, request, currentUser) {
    const category = await ComplaintCategory.findById(id);
    if (!category) {
      const error = new Error(`Category not found with id: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    if (request.name && request.name.trim() !== category.name) {
      const name = request.name.trim();
      const existingName = await ComplaintCategory.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name}$`, 'i') },
      });
      if (existingName) {
        const error = new Error(`Category with name '${name}' already exists`);
        error.statusCode = 400;
        throw error;
      }
      category.name = name;
    }

    if (request.description !== undefined) {
      category.description = request.description;
    }
    if (request.weight !== undefined) {
      category.weight = Number(request.weight);
    }
    if (request.icon !== undefined) {
      category.icon = request.icon;
    }
    if (request.active !== undefined) {
      category.active = Boolean(request.active);
    }

    await category.save();

    await auditService.log(
      'CATEGORY_UPDATED',
      'ComplaintCategory',
      category._id.toString(),
      currentUser,
      `Updated category: ${category.name}`
    );

    return {
      id: category._id.toString(),
      name: category.name,
      code: category.code,
      description: category.description,
      weight: category.weight,
      icon: category.icon,
      active: category.active,
      createdAt: category.createdAt,
    };
  }

  async deleteCategory(id, currentUser) {
    const category = await ComplaintCategory.findById(id);
    if (!category) {
      const error = new Error(`Category not found with id: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    category.active = false;
    await category.save();

    await auditService.log(
      'CATEGORY_DEACTIVATED',
      'ComplaintCategory',
      category._id.toString(),
      currentUser,
      `Deactivated category: ${category.name}`
    );
  }
}

module.exports = new CategoryService();
module.exports.CategoryService = CategoryService;
