const { z } = require('zod');

const registerSchema = {
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(60),
    email: z.string().email('Please enter a valid email address').max(120),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    phone: z.string().max(20).optional().nullable(),
  }),
};

const staffRegisterSchema = {
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(60),
    email: z.string().email('Please enter a valid email address').max(120),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    department: z.string().min(2, 'Department is required for staff accounts').max(100),
    phone: z.string().max(20).optional().nullable(),
  }),
};

const loginSchema = {
  body: z.object({
    usernameOrEmail: z.string().min(1, 'Username or email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
};

const updateProfileSchema = {
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100).optional(),
    phone: z.string().max(20).optional().nullable(),
  }),
};

const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
};

module.exports = {
  registerSchema,
  staffRegisterSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
};
