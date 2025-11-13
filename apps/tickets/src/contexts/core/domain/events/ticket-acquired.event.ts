import { z } from 'zod';

export const TicketAcquiredEventSchema = z.object({
  ticketId: z.string().uuid(),
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
  timestamp: z.string().optional(),
});

export type TicketAcquiredEvent = z.infer<typeof TicketAcquiredEventSchema>;
