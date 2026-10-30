const { z } = require('zod');

const createUserSchema = {
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(60),
    email: z.string().email('Please enter a valid email address').max(120),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    department: z.string().max(100).optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    role: z.enum(['ROLE_CITIZEN', 'ROLE_STAFF', 'ROLE_ADMIN', 'CITIZEN', 'STAFF', 'ADMIN']),
  }),
};

const updateUserSchema = {
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100).optional(),
    department: z.string().max(100).optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    role: z.enum(['ROLE_CITIZEN', 'ROLE_STAFF', 'ROLE_ADMIN', 'CITIZEN', 'STAFF', 'ADMIN']).optional(),
    active: z.boolean().optional(),
  }),
};

module.exports = {
  createUserSchema,
  updateUserSchema,
};
