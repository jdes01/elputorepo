import { z } from 'zod';
import type { Operation } from './operation.ts';
import { IdSchema, TimeSchema } from './shared.schema.ts';

export const ClubSchema = z.object({ id: z.number(), name: z.string() });
export type Club = z.output<typeof ClubSchema>;

// Las respuestas llevan las columnas de la tabla tal cual (club_id en snake_case).
export const CourtSchema = z.object({
  id: z.number(),
  club_id: z.number(),
  name: z.string(),
  opens: TimeSchema,
  closes: TimeSchema,
});
export type Court = z.output<typeof CourtSchema>;

export const createClub = {
  method: 'POST',
  path: '/clubs',
  body: z.object({ name: z.string().trim().min(1).max(100) }),
  response: ClubSchema,
} as const satisfies Operation;

export const listClubs = {
  method: 'GET',
  path: '/clubs',
  response: z.array(ClubSchema),
} as const satisfies Operation;

export const createCourt = {
  method: 'POST',
  path: '/clubs/:clubId/courts',
  params: z.object({ clubId: IdSchema }),
  body: z.object({ name: z.string().trim().min(1).max(100), opens: TimeSchema, closes: TimeSchema }),
  response: CourtSchema,
} as const satisfies Operation;

export const listCourts = {
  method: 'GET',
  path: '/clubs/:clubId/courts',
  params: z.object({ clubId: IdSchema }),
  response: z.array(CourtSchema),
} as const satisfies Operation;
