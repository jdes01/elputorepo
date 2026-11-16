import { describe, expect, it } from 'vitest';
import { CourtId } from '../../../clubs/domain/value-objects/court-id.value-object';
import { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';
import { TimeSlot } from '../../../shared/domain/value-objects/time-slot.value-object';
import { BookingInThePast, CancellationTooLate, NotBookingOwner } from '../errors/booking.errors';
import { BookingId } from '../value-objects/booking-id.value-object';
import { UserId } from '../value-objects/user-id.value-object';
import { Booking } from './booking.entity';

const ana = UserId.of('ana@padel.local');
const luis = UserId.of('luis@padel.local');

// 20 de noviembre de 2026, 10:00 en Madrid.
const now = new Date('2026-11-20T09:00:00Z');

const book = ({ on = '2026-11-25', at = '10:30' } = {}) =>
  Booking.book({
    id: BookingId.of(1),
    courtId: CourtId.of(1),
    userId: ana,
    date: CalendarDate.parse(on),
    slot: TimeSlot.startingAt(TimeOfDay.parse(at)),
    now,
  });

describe('Booking.book', () => {
  it('no en el pasado', () => {
    expect(() => book({ on: '2026-11-20', at: '09:00' })).toThrow(BookingInThePast);
  });

  it('si, mas tarde ese mismo dia', () => {
    expect(() => book({ on: '2026-11-20', at: '10:30' })).not.toThrow();
  });
});

describe('Booking.cancel', () => {
  it('la cancela quien la hizo, con 24 h de antelacion', () => {
    expect(() => book({ on: '2026-11-21', at: '10:30' }).cancel(ana, now)).not.toThrow();
  });

  it('nadie mas puede cancelarla', () => {
    expect(() => book().cancel(luis, now)).toThrow(NotBookingOwner);
  });

  it('no con menos de 24 h', () => {
    expect(() => book({ on: '2026-11-21', at: '09:00' }).cancel(ana, now)).toThrow(CancellationTooLate);
  });
});
