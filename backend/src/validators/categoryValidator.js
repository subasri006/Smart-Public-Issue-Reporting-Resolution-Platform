const { z } = require('zod');

const categorySchema = {
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters').max(60),
    code: z.string().min(2, 'Category code must be at least 2 characters').max(40),
    description: z.string().max(255).optional().nullable(),
    weight: z.number().int().min(1).max(100).optional().default(15),
    icon: z.string().max(50).optional().default('HelpCircle'),
    active: z.boolean().optional().default(true),
  }),
};

module.exports = {
  categorySchema,
};
