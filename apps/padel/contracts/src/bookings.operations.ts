import { z } from 'zod';
import type { Operation } from './operation.ts';
import { DateSchema, IdSchema, TimeSchema } from './shared.schema.ts';

export const BookingSchema = z.object({
  id: z.number(),
  court_id: z.number(),
  user_id: z.string(),
  date: DateSchema,
  start: TimeSchema,
  end: TimeSchema,
});
export type Booking = z.output<typeof BookingSchema>;

export const MyBookingSchema = BookingSchema.extend({ court_name: z.string(), club_name: z.string() });
export type MyBooking = z.output<typeof MyBookingSchema>;

export const SlotSchema = z.object({ start: TimeSchema, end: TimeSchema, free: z.boolean() });
export type Slot = z.output<typeof SlotSchema>;

export const getAvailability = {
  method: 'GET',
  path: '/courts/:courtId/availability',
  params: z.object({ courtId: IdSchema }),
  query: z.object({ date: DateSchema }),
  response: z.array(SlotSchema),
} as const satisfies Operation;

export const bookCourt = {
  method: 'POST',
  path: '/bookings',
  body: z.object({ courtId: z.number().int().positive(), date: DateSchema, start: TimeSchema }),
  response: BookingSchema,
} as const satisfies Operation;

export const cancelBooking = {
  method: 'DELETE',
  path: '/bookings/:id',
  params: z.object({ id: IdSchema }),
  response: z.object({ ok: z.literal(true) }),
} as const satisfies Operation;

export const listMyBookings = {
  method: 'GET',
  path: '/me/bookings',
  response: z.array(MyBookingSchema),
} as const satisfies Operation;
