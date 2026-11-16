import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { testDatabase } from '../../../../integration/database';
import { seed } from '../../../../integration/seed';
import { bookings } from '../../../schema';
import { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';
import { CourtDayChangedMeanwhile, SlotAlreadyTaken } from '../../domain/errors/booking.errors';
import { BookingId } from '../../domain/value-objects/booking-id.value-object';
import { DrizzleCourtDayRepository } from './drizzle-court-day.repository';

const { db, close } = testDatabase();
const given = seed(db);
const courtDays = new DrizzleCourtDayRepository(db);
afterAll(close);

const at = (text: string) => TimeOfDay.parse(text);
const now = new Date('2026-01-01');

describe('DrizzleCourtDayRepository', () => {
  it('carga la agenda con las reservas de esa pista ese dia, y solo esas', async () => {
    const club = await given.club();
    const court = await given.court(club);
    const otherCourt = await given.court(club, { name: 'Pista 2' });
    await given.booking(court, given.someUser(), '2099-02-01', '10:30');
    await given.booking(court, given.someUser(), '2099-02-02', '12:00');
    await given.booking(otherCourt, given.someUser(), '2099-02-01', '12:00');

    const day = await courtDays.load(court, CalendarDate.parse('2099-02-01'));

    expect(() => day.book({ id: BookingId.of(1), userId: given.someUser(), start: at('10:30'), now })).toThrow(
      SlotAlreadyTaken,
    );
    expect(() => day.book({ id: BookingId.of(2), userId: given.someUser(), start: at('12:00'), now })).not.toThrow();
    expect(day.version).toBe(1);
  });

  it('encuentra la agenda de una reserva, y nada si la reserva no existe', async () => {
    const court = await given.court(await given.club());
    const booking = await given.booking(court, given.someUser(), '2099-02-05', '10:30');

    const day = await courtDays.loadContaining(booking.id);

    expect(day?.court.equals(court)).toBe(true);
    expect(day?.date.equals(booking.date)).toBe(true);
    expect(await courtDays.loadContaining(BookingId.of(999_999))).toBeUndefined();
  });

  it('cancelar y guardar no borra la reserva: la marca y libera su franja', async () => {
    const court = await given.court(await given.club());
    const user = given.someUser();
    const booking = await given.booking(court, user, '2099-02-06', '10:30');
    const day = (await courtDays.loadContaining(booking.id))!;

    day.cancel(booking.id, user, now);
    await courtDays.save(day);

    const [row] = await db.select().from(bookings).where(eq(bookings.id, booking.id.toNumber()));
    expect(row?.cancelledAt).toEqual(now);
    const reloaded = await courtDays.load(court, booking.date);
    expect(() => reloaded.book({ id: BookingId.of(2), userId: user, start: at('10:30'), now })).not.toThrow();
  });

  it('dos agendas leidas a la vez: la primera se guarda, la segunda no', async () => {
    const court = await given.court(await given.club());
    const date = CalendarDate.parse('2099-03-01');
    const first = await courtDays.load(court, date);
    const second = await courtDays.load(court, date);
    first.book({ id: await courtDays.nextBookingId(), userId: given.someUser(), start: at('10:30'), now });
    const lost = second.book({
      id: await courtDays.nextBookingId(),
      userId: given.someUser(),
      start: at('12:00'),
      now,
    });

    await courtDays.save(first);

    await expect(courtDays.save(second)).rejects.toThrow(CourtDayChangedMeanwhile);
    const [row] = await db.select().from(bookings).where(eq(bookings.id, lost.id.toNumber()));
    expect(row).toBeUndefined();
  });
});
