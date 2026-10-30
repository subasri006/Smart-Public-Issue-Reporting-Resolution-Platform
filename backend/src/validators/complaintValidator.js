const { z } = require('zod');

const createComplaintSchema = {
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(150),
    description: z.string().min(10, 'Description must be at least 10 characters').max(3000),
    categoryId: z.string().min(1, 'Category is required'),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    latitude: z.union([z.number(), z.string()]).optional().nullable(),
    longitude: z.union([z.number(), z.string()]).optional().nullable(),
    address: z.string().max(255).optional().nullable(),
    landmark: z.string().max(150).optional().nullable(),
  }),
};

const assignComplaintSchema = {
  body: z.object({
    staffId: z.string().min(1, 'Staff member ID is required'),
    notes: z.string().max(500).optional().nullable(),
  }),
};

const updateStatusSchema = {
  body: z.object({
    status: z.enum(['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REOPENED']),
    comment: z.string().max(1000).optional().nullable(),
    resolutionNotes: z.string().max(3000).optional().nullable(),
  }),
};

const addCommentSchema = {
  body: z.object({
    comment: z.string().min(1, 'Comment cannot be empty').max(1500),
    isInternal: z.boolean().optional().default(false),
  }),
};

const checkDuplicateSchema = {
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    latitude: z.union([z.number(), z.string()]).optional().nullable(),
    longitude: z.union([z.number(), z.string()]).optional().nullable(),
  }),
};

module.exports = {
  createComplaintSchema,
  assignComplaintSchema,
  updateStatusSchema,
  addCommentSchema,
  checkDuplicateSchema,
};
