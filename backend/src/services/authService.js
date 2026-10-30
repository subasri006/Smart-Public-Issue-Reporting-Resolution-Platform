const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const env = require('../config/env');
const auditService = require('./auditService');

class AuthService {
  generateToken(user) {
    const payload = {
      id: user._id.toString(),
      sub: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }

  async register(request) {
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
      phone: request.phone ? request.phone.trim() : null,
      role: 'ROLE_CITIZEN', // Strictly enforced as citizen
      active: true,
    });

    await auditService.log(
      'USER_REGISTERED',
      'User',
      user._id.toString(),
      user,
      `Citizen self-registered: ${user.username}`
    );

    const token = this.generateToken(user);

    return {
      token,
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      department: user.department,
      role: user.role,
    };
  }

  async registerStaff(request) {
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
      role: 'ROLE_STAFF', // Strictly enforced as staff
      active: true,
    });

    await auditService.log(
      'STAFF_REGISTERED',
      'User',
      user._id.toString(),
      user,
      `Staff self-registered: ${user.username}`
    );

    const token = this.generateToken(user);

    return {
      token,
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      department: user.department,
      role: user.role,
    };
  }

  async login(request) {
    const input = (request.usernameOrEmail || '').trim();
    const password = request.password;

    if (!input || !password) {
      const error = new Error('Username/email and password are required');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({
      $or: [{ username: input }, { email: input.toLowerCase() }],
    }).select('+password');

    if (!user) {
      const error = new Error('Invalid username/email or password');
      error.statusCode = 401;
      throw error;
    }

    if (!user.active) {
      const error = new Error('Account is deactivated. Contact administrator.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid username/email or password');
      error.statusCode = 401;
      throw error;
    }

    await auditService.log(
      'USER_LOGIN',
      'User',
      user._id.toString(),
      user,
      `User logged in: ${user.username}`
    );

    const token = this.generateToken(user);

    return {
      token,
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      department: user.department,
      role: user.role,
    };
  }

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

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

  async updateProfile(userId, request) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (request.fullName && request.fullName.trim()) {
      user.fullName = request.fullName.trim();
    }
    if (request.phone !== undefined) {
      user.phone = request.phone ? request.phone.trim() : null;
    }

    await user.save();

    await auditService.log(
      'PROFILE_UPDATED',
      'User',
      user._id.toString(),
      user,
      'Profile updated by user'
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

  async changePassword(userId, request) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(request.currentPassword, user.password);
    if (!isMatch) {
      const error = new Error('Current password does not match');
      error.statusCode = 400;
      throw error;
    }

    user.password = await bcrypt.hash(request.newPassword, 10);
    await user.save();

    await auditService.log(
      'PASSWORD_CHANGED',
      'User',
      user._id.toString(),
      user,
      'Password changed by user'
    );
  }
}

module.exports = new AuthService();
module.exports.AuthService = AuthService;
