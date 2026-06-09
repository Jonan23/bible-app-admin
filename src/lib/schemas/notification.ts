import { z } from 'zod';

export const sendNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().optional().or(z.literal('')),
  type: z.enum(['BROADCAST', 'SCHEDULED', 'TOPIC', 'INDIVIDUAL']).default('BROADCAST'),
  topic: z.string().optional().or(z.literal('')),
  userIds: z.array(z.string().uuid()).optional(),
  scheduledAt: z.string().optional().or(z.literal('')),
});

export type SendNotificationForm = z.infer<typeof sendNotificationSchema>;
