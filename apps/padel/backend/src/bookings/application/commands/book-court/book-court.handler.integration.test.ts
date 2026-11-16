import { randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { testDatabase } from '../../../../../integration/database';
import { seed } from '../../../../../integration/seed';
import { DrizzleCourtRepository } from '../../../../clubs/infrastructure/persistence/drizzle-court.repository';
import { CalendarDate } from '../../../../shared/domain/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../../../../shared/domain/value-objects/time-of-day.value-object';
import { RecordingEventBus } from '../../../../shared/infrastructure/recording-event-bus';
import { UserId } from '../../../domain/value-objects/user-id.value-object';
import { DrizzleCourtDayRepository } from '../../../infrastructure/persistence/drizzle-court-day.repository';
import { BookCourtCommand } from './book-court.command';
import { BookCourtHandler } from './book-court.handler';

const { db, close } = testDatabase();
const given = seed(db);
afterAll(close);

const handler = () =>
  new BookCourtHandler(new DrizzleCourtRepository(db), new DrizzleCourtDayRepository(db), new RecordingEventBus());

describe('BookCourtHandler contra Postgres', () => {
  it('diez reservas a la vez de la misma franja: solo entra una', async () => {
    const court = await given.court(await given.club());
    // Diez conexiones abiertas antes de empezar: que ninguna peticion espere a
    // conectarse mientras otra termina. Asi llegan a la vez, como en produccion.
    await Promise.all(Array.from({ length: 10 }, () => db.execute(sql`SELECT 1`)));
    const date = CalendarDate.parse('2099-06-01');
    const start = TimeOfDay.parse('10:30');

    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () =>
        handler().execute(new BookCourtCommand(UserId.of(`${randomUUID()}@padel.local`), court.id, date, start)),
      ),
    );

    const booked = results.filter((r) => r.status === 'fulfilled');
    expect(booked).toHaveLength(1);
  });

  it('cinco reservas a la vez de franjas distintas: entran todas', async () => {
    const court = await given.court(await given.club());
    const date = CalendarDate.parse('2099-06-02');
    await Promise.all(Array.from({ length: 10 }, () => db.execute(sql`SELECT 1`)));

    const starts = ['09:00', '10:30', '12:00', '13:30', '15:00'];
    const results = await Promise.allSettled(
      starts.map((start) =>
        handler().execute(
          new BookCourtCommand(UserId.of(`${randomUUID()}@padel.local`), court.id, date, TimeOfDay.parse(start)),
        ),
      ),
    );

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(5);
  });
});
