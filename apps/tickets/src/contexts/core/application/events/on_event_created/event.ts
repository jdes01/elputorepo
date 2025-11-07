import { z } from 'zod';

export const EventCreatedSchema = z.object({
  event_id: z.union([
    z.object({ value: z.string() }),
    z.string(),
  ]),
  name: z.union([
    z.object({ value: z.string() }),
    z.string(),
  ]).optional(),
  capacity: z.union([
    z.object({ value: z.number() }),
    z.number(),
  ]),
  timestamp: z.string().optional(),
});

export type EventCreatedMessage = z.infer<typeof EventCreatedSchema>;

