import { sql } from 'drizzle-orm';
import { check, integer, pgTable, primaryKey, serial, text } from 'drizzle-orm/pg-core';

// La fuente de verdad del schema. drizzle-kit genera migrations/ comparando este
// fichero con el ultimo snapshot.

export const clubs = pgTable('clubs', {
  id: serial().primaryKey(),
  name: text().notNull(),
});

export const courts = pgTable(
  'courts',
  {
    id: serial().primaryKey(),
    clubId: integer('club_id')
      .notNull()
      .references(() => clubs.id),
    name: text().notNull(),
    opens: text().notNull(),
    closes: text().notNull(),
  },
  // Ultima linea de defensa: aunque el codigo se equivoque, la BD no guarda una
  // pista que cierra antes de abrir. "HH:MM" se ordena bien como texto.
  (t) => [check('courts_opens_before_closes', sql`${t.opens} < ${t.closes}`)],
);

export const bookings = pgTable('bookings', {
  id: serial().primaryKey(),
  courtId: integer('court_id')
    .notNull()
    .references(() => courts.id),
  userId: text('user_id').notNull(),
  date: text().notNull(),
  start: text().notNull(),
  end: text().notNull(),
});

// La version de la agenda de cada pista y dia (el aggregate CourtDay). Cada
// reserva la sube en uno; si al guardar ya no es la que se leyo, alguien se
// adelanto. Un dia sin fila es un dia sin reservas: version 0.
export const courtDays = pgTable(
  'court_days',
  {
    courtId: integer('court_id')
      .notNull()
      .references(() => courts.id),
    date: text().notNull(),
    version: integer().notNull(),
  },
  (t) => [primaryKey({ columns: [t.courtId, t.date] })],
);
