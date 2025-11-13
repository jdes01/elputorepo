import { z } from 'zod';

export const EventDeletedSchema = z.object({
  event_id: z.union([z.object({ value: z.string() }), z.string()]),
  timestamp: z.string().optional(),
});

export type EventDeletedMessage = z.infer<typeof EventDeletedSchema>;
