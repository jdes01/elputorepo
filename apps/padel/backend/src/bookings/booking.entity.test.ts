import { describe, expect, it } from 'vitest';
import { Club } from '../clubs/club.entity';
import { SlotOutsideOpeningHours } from '../clubs/club.errors';
import { Court } from '../clubs/court.entity';
import { ClubId } from '../clubs/value-objects/club-id.value-object';
import { ClubName } from '../clubs/value-objects/club-name.value-object';
import { CourtId } from '../clubs/value-objects/court-id.value-object';
import { CourtName } from '../clubs/value-objects/court-name.value-object';
import { OpeningHours } from '../clubs/value-objects/opening-hours.value-object';
import { CalendarDate } from '../shared/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../shared/value-objects/time-of-day.value-object';
import { Booking } from './booking.entity';
import { BookingInThePast, CancellationTooLate, NotBookingOwner, SlotAlreadyTaken } from './booking.errors';
import { BookingId } from './value-objects/booking-id.value-object';
import { UserId } from './value-objects/user-id.value-object';

const club = Club.register(ClubId.of(1), ClubName.of('Club Norte'));
const openingHours = OpeningHours.of(TimeOfDay.parse('09:00'), TimeOfDay.parse('22:30'));
const court = Court.open(CourtId.of(1), club, CourtName.of('Pista 1'), openingHours);
const otherCourt = Court.open(CourtId.of(2), club, CourtName.of('Pista 2'), openingHours);
const ana = UserId.of('ana@padel.local');
const luis = UserId.of('luis@padel.local');

// 20 de noviembre de 2026, 10:00 en Madrid.
const now = new Date('2026-11-20T09:00:00Z');

function book(overrides: Partial<Parameters<typeof Booking.book>[0]> & { at?: string; on?: string } = {}) {
  const { at = '10:30', on = '2026-11-25', ...rest } = overrides;
  return Booking.book({
    id: BookingId.of(1),
    court,
    userId: ana,
    date: CalendarDate.parse(on),
    start: TimeOfDay.parse(at),
    taken: [],
    now,
    ...rest,
  });
}

describe('Booking.book', () => {
  it('reserva la franja de 90 minutos que empieza a esa hora', () => {
    const booking = book({ at: '10:30' });

    expect(booking.slot.end.toString()).toBe('12:00');
    expect(booking.courtId.equals(court.id)).toBe(true);
  });

  it('solo en las franjas de la pista', () => {
    expect(() => book({ at: '10:00' })).toThrow(SlotOutsideOpeningHours);
  });

  it('no en el pasado', () => {
    expect(() => book({ on: '2026-11-20', at: '09:00' })).toThrow(BookingInThePast);
  });

  it('si, mas tarde ese mismo dia', () => {
    expect(() => book({ on: '2026-11-20', at: '10:30' })).not.toThrow();
  });

  it('no en una franja que ya esta reservada', () => {
    const taken = book({ at: '10:30' });

    expect(() => book({ at: '10:30', taken: [taken] })).toThrow(SlotAlreadyTaken);
  });

  it('si, justo cuando acaba otra reserva', () => {
    const taken = book({ at: '10:30' });

    expect(() => book({ at: '12:00', taken: [taken] })).not.toThrow();
  });

  it('las reservas de otro dia o de otra pista no la ocupan', () => {
    const otherDay = book({ at: '10:30', on: '2026-11-26' });
    const elsewhere = book({ at: '10:30', court: otherCourt });

    expect(() => book({ at: '10:30', taken: [otherDay, elsewhere] })).not.toThrow();
  });
});

describe('Booking.cancel', () => {
  it('la cancela quien la hizo, con 24 h de antelacion', () => {
    const booking = book({ on: '2026-11-21', at: '10:30' });

    expect(() => booking.cancel(ana, now)).not.toThrow();
  });

  it('nadie mas puede cancelarla', () => {
    expect(() => book().cancel(luis, now)).toThrow(NotBookingOwner);
  });

  it('no con menos de 24 h', () => {
    const booking = book({ on: '2026-11-21', at: '09:00' });

    expect(() => booking.cancel(ana, now)).toThrow(CancellationTooLate);
  });
});
