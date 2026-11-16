import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { testDatabase } from '../../../../integration/database';
import { Club } from '../../../clubs/domain/entities/club.entity';
import { Court } from '../../../clubs/domain/entities/court.entity';
import { DrizzleClubRepository } from '../../../clubs/infrastructure/persistence/drizzle-club.repository';
import { DrizzleCourtRepository } from '../../../clubs/infrastructure/persistence/drizzle-court.repository';
import { ClubName } from '../../../clubs/domain/value-objects/club-name.value-object';
import { CourtName } from '../../../clubs/domain/value-objects/court-name.value-object';
import { OpeningHours } from '../../../clubs/domain/value-objects/opening-hours.value-object';
import { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';
import { Booking } from '../../domain/entities/booking.entity';
import { DrizzleBookingRepository } from './drizzle-booking.repository';
import { UserId } from '../../domain/value-objects/user-id.value-object';

const { db, close } = testDatabase();
const bookings = new DrizzleBookingRepository(db);
afterAll(close);

let court: Court;
let otherCourt: Court;

beforeAll(async () => {
  const clubs = new DrizzleClubRepository(db);
  const courts = new DrizzleCourtRepository(db);
  const club = Club.register(await clubs.nextId(), ClubName.of('Club Norte'));
  await clubs.save(club);
  const hours = OpeningHours.of(TimeOfDay.parse('09:00'), TimeOfDay.parse('22:30'));
  court = Court.open(await courts.nextId(), club, CourtName.of('Pista 1'), hours);
  otherCourt = Court.open(await courts.nextId(), club, CourtName.of('Pista 2'), hours);
  await courts.save(court);
  await courts.save(otherCourt);
});

const someUser = () => UserId.of(`${randomUUID()}@padel.local`);

async function givenBooking({ on = '2099-01-10', at = '10:30', by = someUser(), onCourt = court } = {}) {
  const booking = Booking.book({
    id: await bookings.nextId(),
    court: onCourt,
    userId: by,
    date: CalendarDate.parse(on),
    start: TimeOfDay.parse(at),
    taken: [],
    now: new Date('2026-01-01'),
  });
  await bookings.save(booking);
  return booking;
}

describe('DrizzleBookingRepository', () => {
  it('guarda una reserva y la devuelve igual', async () => {
    const booking = await givenBooking();

    const found = await bookings.findById(booking.id);

    expect(found?.equals(booking)).toBe(true);
    expect(found?.userId.equals(booking.userId)).toBe(true);
    expect(found?.date.equals(booking.date)).toBe(true);
    expect(found?.slot.equals(booking.slot)).toBe(true);
  });

  it('por pista y dia, solo las de esa pista ese dia', async () => {
    const mine = await givenBooking({ on: '2099-02-01', at: '10:30' });
    await givenBooking({ on: '2099-02-02', at: '10:30' });
    await givenBooking({ on: '2099-02-01', at: '10:30', onCourt: otherCourt });

    const found = await bookings.findByCourtAndDate(court.id, CalendarDate.parse('2099-02-01'));

    expect(found.map((b) => b.id.toNumber())).toEqual([mine.id.toNumber()]);
  });

  it('por usuario, solo las suyas, por fecha y hora', async () => {
    const user = someUser();
    const later = await givenBooking({ by: user, on: '2099-03-02', at: '09:00' });
    const sameDayLate = await givenBooking({ by: user, on: '2099-03-01', at: '12:00' });
    const sameDayEarly = await givenBooking({ by: user, on: '2099-03-01', at: '10:30' });
    await givenBooking({ on: '2099-03-01', at: '13:30' });

    const found = await bookings.findByUser(user);

    expect(found.map((b) => b.id.toNumber())).toEqual([sameDayEarly, sameDayLate, later].map((b) => b.id.toNumber()));
  });

  it('una reserva quitada ya no esta', async () => {
    const booking = await givenBooking();

    await bookings.remove(booking);

    expect(await bookings.findById(booking.id)).toBeUndefined();
  });
});
