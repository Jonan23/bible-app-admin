import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  roleId: z.string().uuid('Please select a role'),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']).default('ACTIVE'),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export type CreateUserForm = z.infer<typeof createUserSchema>;
export type UpdateUserForm = z.infer<typeof updateUserSchema>;
