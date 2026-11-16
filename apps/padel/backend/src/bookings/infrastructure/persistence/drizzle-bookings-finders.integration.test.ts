import { afterAll, describe, expect, it } from 'vitest';
import { testDatabase } from '../../../../integration/database';
import { seed } from '../../../../integration/seed';
import { CourtId } from '../../../clubs/domain/value-objects/court-id.value-object';
import { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import { DrizzleCourtDayFinder } from './drizzle-court-day.finder';
import { DrizzleMyBookingsFinder } from './drizzle-my-bookings.finder';

const { db, close } = testDatabase();
const given = seed(db);
afterAll(close);

describe('DrizzleCourtDayFinder', () => {
  it('da el horario de la pista y las reservas de ese dia', async () => {
    const club = await given.club();
    const court = await given.court(club);
    const otherCourt = await given.court(club, { name: 'Pista 2' });
    await given.booking(court, given.someUser(), '2099-02-01', '10:30');
    await given.booking(court, given.someUser(), '2099-02-01', '13:30');
    await given.booking(court, given.someUser(), '2099-02-02', '09:00');
    await given.booking(otherCourt, given.someUser(), '2099-02-01', '12:00');

    const day = await new DrizzleCourtDayFinder(db).find(court.id, CalendarDate.parse('2099-02-01'));

    expect(day).toEqual({ opens: '09:00', closes: '22:30', bookedStarts: expect.any(Array) });
    expect(day?.bookedStarts.toSorted()).toEqual(['10:30', '13:30']);
  });

  it('no da nada si la pista no existe', async () => {
    const day = await new DrizzleCourtDayFinder(db).find(CourtId.of(999_999), CalendarDate.parse('2099-02-01'));

    expect(day).toBeUndefined();
  });
});

describe('DrizzleMyBookingsFinder', () => {
  it('da solo las del usuario, con pista y club, por fecha y hora', async () => {
    const club = await given.club('Club Norte');
    const court = await given.court(club, { name: 'Pista 1' });
    const me = given.someUser();
    const later = await given.booking(court, me, '2099-03-02', '09:00');
    const sameDayLate = await given.booking(court, me, '2099-03-01', '12:00');
    const sameDayEarly = await given.booking(court, me, '2099-03-01', '10:30');
    await given.booking(court, given.someUser(), '2099-03-01', '13:30');

    const mine = await new DrizzleMyBookingsFinder(db).ofUser(me);

    expect(mine.map((b) => b.id)).toEqual([sameDayEarly, sameDayLate, later].map((b) => b.id.toNumber()));
    expect(mine[0]).toEqual({
      id: sameDayEarly.id.toNumber(),
      courtId: court.id.toNumber(),
      userId: me.toString(),
      date: '2099-03-01',
      start: '10:30',
      end: '12:00',
      courtName: 'Pista 1',
      clubName: 'Club Norte',
    });
  });
});
