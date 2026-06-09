import { z } from 'zod';

export const createVideoSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().optional().or(z.literal('')),
  youtubeUrl: z.string().url('Please enter a valid YouTube URL'),
  thumbnail: z.string().url().optional().or(z.literal('')),
  speakerId: z.string().uuid().optional().or(z.literal('')),
  duration: z.number().int().positive().optional(),
  categoryId: z.string().uuid().optional().or(z.literal('')),
  featured: z.boolean().default(false),
});

export const updateVideoSchema = createVideoSchema.partial();

export type CreateVideoForm = z.infer<typeof createVideoSchema>;
export type UpdateVideoForm = z.infer<typeof updateVideoSchema>;
