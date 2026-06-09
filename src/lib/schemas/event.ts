import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().optional().or(z.literal('')),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().or(z.literal('')),
  location: z.string().max(300).optional().or(z.literal('')),
  bannerImage: z.string().url().optional().or(z.literal('')),
  registrationLink: z.string().url().optional().or(z.literal('')),
  status: z.enum(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']).default('UPCOMING'),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventForm = z.infer<typeof createEventSchema>;
export type UpdateEventForm = z.infer<typeof updateEventSchema>;
