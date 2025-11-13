import { z } from 'zod';

export const UserCreatedSchema = z.object({
  user_id: z.union([z.object({ value: z.string() }), z.string()]),
  email: z.union([z.object({ value: z.string() }), z.string()]),
  timestamp: z.string().optional(),
});

export type UserCreatedMessage = z.infer<typeof UserCreatedSchema>;
