import { beforeEach, describe, expect, it } from 'vitest';
import { Club } from '../../../../clubs/domain/entities/club.entity';
import { Court } from '../../../../clubs/domain/entities/court.entity';
import { ClubId } from '../../../../clubs/domain/value-objects/club-id.value-object';
import { ClubName } from '../../../../clubs/domain/value-objects/club-name.value-object';
import { CourtId } from '../../../../clubs/domain/value-objects/court-id.value-object';
import { CourtName } from '../../../../clubs/domain/value-objects/court-name.value-object';
import { OpeningHours } from '../../../../clubs/domain/value-objects/opening-hours.value-object';
import { InMemoryCourtRepository } from '../../../../clubs/infrastructure/persistence/in-memory-court.repository';
import { CalendarDate } from '../../../../shared/domain/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../../../../shared/domain/value-objects/time-of-day.value-object';
import { BookingNotFound } from '../../../domain/errors/booking.errors';
import { BookingId } from '../../../domain/value-objects/booking-id.value-object';
import { UserId } from '../../../domain/value-objects/user-id.value-object';
import { InMemoryCourtDayRepository } from '../../../infrastructure/persistence/in-memory-court-day.repository';
import { CancelBookingCommand } from './cancel-booking.command';
import { CancelBookingHandler } from './cancel-booking.handler';

const ana = UserId.of('ana@padel.local');
const date = CalendarDate.parse('2099-01-10');
let courtDays: InMemoryCourtDayRepository;
let court: Court;

beforeEach(async () => {
  const courts = new InMemoryCourtRepository();
  courtDays = new InMemoryCourtDayRepository(courts);
  const club = Club.register(ClubId.of(1), ClubName.of('Club Norte'));
  const hours = OpeningHours.of(TimeOfDay.parse('09:00'), TimeOfDay.parse('22:30'));
  court = Court.open(CourtId.of(1), club, CourtName.of('Pista 1'), hours);
  await courts.save(court);
});

describe('CancelBookingHandler', () => {
  it('quita la reserva de su agenda', async () => {
    const day = await courtDays.load(court, date);
    const booking = day.book({
      id: await courtDays.nextBookingId(),
      userId: ana,
      start: TimeOfDay.parse('10:30'),
      now: new Date(),
    });
    await courtDays.save(day);

    await new CancelBookingHandler(courtDays).execute(new CancelBookingCommand(ana, booking.id));

    expect(courtDays.allBookings()).toEqual([]);
  });

  it('una reserva que no existe no se cancela', async () => {
    const cancel = new CancelBookingHandler(courtDays).execute(new CancelBookingCommand(ana, BookingId.of(999)));

    await expect(cancel).rejects.toThrow(BookingNotFound);
  });
});
