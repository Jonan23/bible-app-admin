import { z } from 'zod';

export const createDailyContentSchema = z.object({
  type: z.enum(['verse', 'quote']),
  content: z.string().min(1, 'Content is required'),
  book: z.string().optional().nullable(),
  chapter: z.coerce.number().optional().nullable(),
  verse: z.coerce.number().optional().nullable(),
  reference: z.string().optional().nullable(),
  author: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateDailyContentSchema = createDailyContentSchema.partial();

export type CreateDailyContentForm = z.infer<typeof createDailyContentSchema>;
export type UpdateDailyContentForm = z.infer<typeof updateDailyContentSchema>;
