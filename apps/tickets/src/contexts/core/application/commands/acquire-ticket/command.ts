import { z } from 'zod';

export const AcquireTicketCommandSchema = z.object({
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type AcquireTicketCommand = z.infer<typeof AcquireTicketCommandSchema>;
