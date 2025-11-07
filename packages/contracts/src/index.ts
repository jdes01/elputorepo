import { z } from 'zod';

// EventCreated Contract
export const EventCreatedSchema = z.object({
  event_id: z.string().uuid(),
  name: z.string().optional(),
  capacity: z.number().int().positive(),
  timestamp: z.string().optional(),
});

export type EventCreated = z.infer<typeof EventCreatedSchema>;

// EventDeleted Contract
export const EventDeletedSchema = z.object({
  event_id: z.string().uuid(),
  timestamp: z.string().optional(),
});

export type EventDeleted = z.infer<typeof EventDeletedSchema>;

// UserCreated Contract
export const UserCreatedSchema = z.object({
  user_id: z.string().uuid(),
  email: z.string().email(),
  timestamp: z.string().optional(),
});

export type UserCreated = z.infer<typeof UserCreatedSchema>;

// TicketAcquired Contract
export const TicketAcquiredSchema = z.object({
  ticketId: z.string().uuid(),
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
  timestamp: z.string().optional(),
});

export type TicketAcquired = z.infer<typeof TicketAcquiredSchema>;

