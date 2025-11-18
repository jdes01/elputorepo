import { z } from 'zod';

export const AcquireTicketCommandSchema = z.object({
  eventId: z.string(),
  userId: z.string(),
});

export type AcquireTicketCommand = z.infer<typeof AcquireTicketCommandSchema>;

