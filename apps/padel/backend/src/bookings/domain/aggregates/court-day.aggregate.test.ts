import { describe, expect, it } from 'vitest';
import { Club } from '../../../clubs/domain/entities/club.entity';
import { Court } from '../../../clubs/domain/entities/court.entity';
import { SlotOutsideOpeningHours } from '../../../clubs/domain/errors/club.errors';
import { ClubId } from '../../../clubs/domain/value-objects/club-id.value-object';
import { ClubName } from '../../../clubs/domain/value-objects/club-name.value-object';
import { CourtId } from '../../../clubs/domain/value-objects/court-id.value-object';
import { CourtName } from '../../../clubs/domain/value-objects/court-name.value-object';
import { OpeningHours } from '../../../clubs/domain/value-objects/opening-hours.value-object';
import { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';
import { BookingNotFound, CancellationTooLate, NotBookingOwner, SlotAlreadyTaken } from '../errors/booking.errors';
import { BookingId } from '../value-objects/booking-id.value-object';
import { UserId } from '../value-objects/user-id.value-object';
import { CourtDay } from './court-day.aggregate';

const club = Club.register(ClubId.of(1), ClubName.of('Club Norte'));
const hours = OpeningHours.of(TimeOfDay.parse('09:00'), TimeOfDay.parse('15:00'));
const court = Court.open(CourtId.of(1), club, CourtName.of('Pista 1'), hours);
const date = CalendarDate.parse('2099-01-10');
const now = new Date('2026-01-01');
const ana = UserId.of('ana@padel.local');
const luis = UserId.of('luis@padel.local');

const emptyDay = () => CourtDay.open(court, date, [], 0);
let lastId = 0;
const bookIn = (day: CourtDay, start: string, by = ana) =>
  day.book({ id: BookingId.of(++lastId), userId: by, start: TimeOfDay.parse(start), now });

describe('CourtDay: la rejilla', () => {
  it('reserva una franja libre de la rejilla, de 90 minutos', () => {
    const booking = bookIn(emptyDay(), '10:30');

    expect(booking.slot.end.toString()).toBe('12:00');
    expect(booking.courtId.equals(court.id)).toBe(true);
    expect(booking.date.equals(date)).toBe(true);
  });

  it.each(['10:00', '08:00', '15:00'])('a las %s no hay franja', (start) => {
    expect(() => bookIn(emptyDay(), start)).toThrow(SlotOutsideOpeningHours);
  });

  it('una franja ocupada no se puede reservar', () => {
    const day = emptyDay();
    bookIn(day, '10:30');

    expect(() => bookIn(day, '10:30', luis)).toThrow(SlotAlreadyTaken);
  });

  it('la franja de al lado si, aunque empiece justo cuando acaba la otra', () => {
    const day = emptyDay();
    bookIn(day, '10:30');

    expect(() => bookIn(day, '12:00', luis)).not.toThrow();
  });

  it('las reservas que ya tenia ocupan su franja, pero no son nuevas', () => {
    const existing = bookIn(emptyDay(), '10:30');
    const day = CourtDay.open(court, date, [existing], 3);

    expect(() => bookIn(day, '10:30', luis)).toThrow(SlotAlreadyTaken);
    expect(day.newBookings()).toEqual([]);
    expect(day.version).toBe(3);
  });

  it('apunta como nuevas las reservas que hace', () => {
    const day = emptyDay();

    const booking = bookIn(day, '10:30');

    expect(day.newBookings()).toEqual([booking]);
  });
});

describe('CourtDay: cancelar', () => {
  it('cancelar deja la franja libre otra vez', () => {
    const day = emptyDay();
    const booking = bookIn(day, '10:30');

    day.cancel(booking.id, ana, now);

    expect(day.cancelledBookings()).toEqual([booking]);
    expect(() => bookIn(day, '10:30', luis)).not.toThrow();
  });

  it('solo cancela quien reservo, y con 24 h', () => {
    const day = emptyDay();
    const booking = bookIn(day, '10:30');

    expect(() => day.cancel(booking.id, luis, now)).toThrow(NotBookingOwner);
    expect(() => day.cancel(booking.id, ana, new Date('2099-01-10T08:00:00Z'))).toThrow(CancellationTooLate);
  });

  it('una reserva cancelada no ocupa su franja al abrir la agenda', () => {
    const day = emptyDay();
    const booking = bookIn(day, '10:30');
    day.cancel(booking.id, ana, now);

    const reopened = CourtDay.open(court, date, [booking], 1);

    expect(() => bookIn(reopened, '10:30', luis)).not.toThrow();
  });

  it('una reserva que no esta en la agenda no se cancela', () => {
    expect(() => emptyDay().cancel(BookingId.of(999), ana, now)).toThrow(BookingNotFound);
  });
});
