import { z } from 'zod';

export const createBlogPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  slug: z.string().min(3).max(200).optional(),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  excerpt: z.string().max(500).optional(),
  featuredImage: z.string().url().optional().or(z.literal('')),
  categoryId: z.string().uuid().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  featured: z.boolean().default(false),
});

export const updateBlogPostSchema = createBlogPostSchema.partial().extend({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export type CreateBlogPostForm = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostForm = z.infer<typeof updateBlogPostSchema>;
