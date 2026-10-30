const bcrypt = require('bcryptjs');
const { User, Complaint } = require('../models');
const { PagedResponse } = require('../utils/apiResponse');
const auditService = require('./auditService');

class UserService {
  async getUsers(role, search, page = 0, size = 15) {
    const pageNum = Math.max(0, parseInt(page, 10) || 0);
    const pageSize = Math.min(100, Math.max(1, parseInt(size, 10) || 15));

    const filter = {};
    if (role) {
      filter.role = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    }

    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, 'i');
      filter.$or = [{ username: regex }, { email: regex }, { fullName: regex }];
    }

    const totalElements = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(pageNum * pageSize)
      .limit(pageSize)
      .lean();

    const content = await Promise.all(
      users.map(async (u) => {
        const dto = {
          id: u._id.toString(),
          username: u.username,
          email: u.email,
          fullName: u.fullName,
          department: u.department,
          phone: u.phone,
          role: u.role,
          active: u.active,
          createdAt: u.createdAt,
        };

        if (u.role === 'ROLE_STAFF') {
          dto.assignedCount = await Complaint.countDocuments({ assignedStaff: u._id });
          dto.resolvedCount = await Complaint.countDocuments({
            assignedStaff: u._id,
            status: 'RESOLVED',
          });
        }

        return dto;
      })
    );

    return PagedResponse.create(content, pageNum, pageSize, totalElements);
  }

  async getStaffMembers() {
    const staff = await User.find({ role: 'ROLE_STAFF', active: true })
      .sort({ fullName: 1 })
      .lean();

    return Promise.all(
      staff.map(async (u) => {
        const assignedCount = await Complaint.countDocuments({ assignedStaff: u._id });
        const resolvedCount = await Complaint.countDocuments({
          assignedStaff: u._id,
          status: 'RESOLVED',
        });

        return {
          id: u._id.toString(),
          username: u.username,
          email: u.email,
          fullName: u.fullName,
          department: u.department,
          phone: u.phone,
          role: u.role,
          active: u.active,
          createdAt: u.createdAt,
          assignedCount,
          resolvedCount,
        };
      })
    );
  }

  async getUserById(id) {
    const user = await User.findById(id).lean();
    if (!user) {
      const error = new Error(`User not found with id: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    const dto = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      department: user.department,
      phone: user.phone,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
    };

    if (user.role === 'ROLE_STAFF') {
      dto.assignedCount = await Complaint.countDocuments({ assignedStaff: user._id });
      dto.resolvedCount = await Complaint.countDocuments({
        assignedStaff: user._id,
        status: 'RESOLVED',
      });
    }

    return dto;
  }

  async createUser(request, currentUser) {
    const targetRole = request.role
      ? request.role.startsWith('ROLE_')
        ? request.role
        : `ROLE_${request.role}`
      : 'ROLE_CITIZEN';

    // Single administrator rule
    if (targetRole === 'ROLE_ADMIN') {
      const adminCount = await User.countDocuments({ role: 'ROLE_ADMIN' });
      if (adminCount >= 1) {
        const error = new Error(
          'An administrator account already exists. CivicFix permits exactly one administrator.'
        );
        error.statusCode = 400;
        throw error;
      }
    }

    const username = request.username.trim();
    const email = request.email.trim().toLowerCase();

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      const error = new Error('Username is already taken');
      error.statusCode = 409;
      throw error;
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      const error = new Error('Email is already registered');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(request.password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      fullName: request.fullName.trim(),
      department: request.department ? request.department.trim() : null,
      phone: request.phone ? request.phone.trim() : null,
      role: targetRole,
      active: true,
    });

    await auditService.log(
      'USER_CREATED_BY_ADMIN',
      'User',
      user._id.toString(),
      currentUser,
      `Created user ${user.username} with role ${user.role}`
    );

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      department: user.department,
      phone: user.phone,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
    };
  }

  async updateUser(id, request, currentUser) {
    const user = await User.findById(id);
    if (!user) {
      const error = new Error(`User not found with id: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    const newRole = request.role
      ? request.role.startsWith('ROLE_')
        ? request.role
        : `ROLE_${request.role}`
      : undefined;

    // Single administrator protection rules
    if (user.role === 'ROLE_ADMIN') {
      if (newRole && newRole !== 'ROLE_ADMIN') {
        const error = new Error('Cannot change the role of the primary administrator.');
        error.statusCode = 400;
        throw error;
      }
      if (request.active === false) {
        const error = new Error('Cannot deactivate the primary administrator account.');
        error.statusCode = 400;
        throw error;
      }
    } else if (newRole === 'ROLE_ADMIN') {
      const adminCount = await User.countDocuments({ role: 'ROLE_ADMIN' });
      if (adminCount >= 1) {
        const error = new Error(
          'Cannot promote user to administrator. CivicFix permits exactly one administrator.'
        );
        error.statusCode = 400;
        throw error;
      }
    }

    if (request.fullName && request.fullName.trim()) {
      user.fullName = request.fullName.trim();
    }
    if (request.department !== undefined) {
      user.department = request.department ? request.department.trim() : null;
    }
    if (request.phone !== undefined) {
      user.phone = request.phone ? request.phone.trim() : null;
    }
    if (newRole) {
      user.role = newRole;
    }
    if (request.active !== undefined) {
      user.active = Boolean(request.active);
    }

    await user.save();

    await auditService.log(
      'USER_UPDATED_BY_ADMIN',
      'User',
      user._id.toString(),
      currentUser,
      `Updated user ${user.username} (role: ${user.role}, active: ${user.active})`
    );

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      department: user.department,
      phone: user.phone,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
    };
  }
}

module.exports = new UserService();
module.exports.UserService = UserService;
