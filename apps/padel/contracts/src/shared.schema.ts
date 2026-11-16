import { z } from 'zod';

// Formas, no reglas de negocio. "09:00" es una hora bien escrita; que la pista
// abra antes de cerrar es una regla del dominio y no vive aqui.
export const TimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'hora en formato HH:MM');
export const DateSchema = z.iso.date();

// Los ids viajan en la ruta como texto: se coercionan a numero.
export const IdSchema = z.coerce.number().int().positive();

// Lo que responde Nest cuando algo falla.
export const ApiErrorSchema = z.object({ statusCode: z.number(), message: z.string() });
export type ApiError = z.output<typeof ApiErrorSchema>;
