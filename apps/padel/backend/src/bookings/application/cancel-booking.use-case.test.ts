import { describe, expect, it } from 'vitest';
import { Club } from '../../clubs/domain/entities/club.entity';
import { Court } from '../../clubs/domain/entities/court.entity';
import { ClubId } from '../../clubs/domain/value-objects/club-id.value-object';
import { ClubName } from '../../clubs/domain/value-objects/club-name.value-object';
import { CourtId } from '../../clubs/domain/value-objects/court-id.value-object';
import { CourtName } from '../../clubs/domain/value-objects/court-name.value-object';
import { OpeningHours } from '../../clubs/domain/value-objects/opening-hours.value-object';
import { CalendarDate } from '../../shared/domain/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../../shared/domain/value-objects/time-of-day.value-object';
import { Booking } from '../domain/entities/booking.entity';
import { BookingNotFound } from '../domain/errors/booking.errors';
import { BookingId } from '../domain/value-objects/booking-id.value-object';
import { UserId } from '../domain/value-objects/user-id.value-object';
import { InMemoryBookingRepository } from '../infrastructure/persistence/in-memory-booking.repository';
import { CancelBooking } from './cancel-booking.use-case';

const ana = UserId.of('ana@padel.local');
const club = Club.register(ClubId.of(1), ClubName.of('Club Norte'));
const hours = OpeningHours.of(TimeOfDay.parse('09:00'), TimeOfDay.parse('22:30'));
const court = Court.open(CourtId.of(1), club, CourtName.of('Pista 1'), hours);

describe('CancelBooking', () => {
  it('quita la reserva', async () => {
    const bookings = new InMemoryBookingRepository();
    const booking = Booking.book({
      id: await bookings.nextId(),
      court,
      userId: ana,
      date: CalendarDate.parse('2099-01-10'),
      start: TimeOfDay.parse('10:30'),
      taken: [],
      now: new Date(),
    });
    await bookings.save(booking);

    await new CancelBooking(bookings).execute(ana, booking.id);

    expect(await bookings.findById(booking.id)).toBeUndefined();
  });

  it('una reserva que no existe no se cancela', async () => {
    const cancel = new CancelBooking(new InMemoryBookingRepository()).execute(ana, BookingId.of(999));

    await expect(cancel).rejects.toThrow(BookingNotFound);
  });
});
