import { beforeEach, describe, expect, it } from 'vitest';
import { Club } from '../../../../clubs/domain/entities/club.entity';
import { Court } from '../../../../clubs/domain/entities/court.entity';
import { CourtNotFound } from '../../../../clubs/domain/errors/club.errors';
import { ClubName } from '../../../../clubs/domain/value-objects/club-name.value-object';
import { CourtId } from '../../../../clubs/domain/value-objects/court-id.value-object';
import { CourtName } from '../../../../clubs/domain/value-objects/court-name.value-object';
import { OpeningHours } from '../../../../clubs/domain/value-objects/opening-hours.value-object';
import { InMemoryClubRepository } from '../../../../clubs/infrastructure/persistence/in-memory-club.repository';
import { InMemoryCourtRepository } from '../../../../clubs/infrastructure/persistence/in-memory-court.repository';
import { CalendarDate } from '../../../../shared/domain/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../../../../shared/domain/value-objects/time-of-day.value-object';
import { RecordingEventBus } from '../../../../shared/infrastructure/recording-event-bus';
import { SlotAlreadyTaken } from '../../../domain/errors/booking.errors';
import { CourtWasBookedEvent } from '../../../domain/events/court-was-booked.event';
import { UserId } from '../../../domain/value-objects/user-id.value-object';
import { InMemoryBookingRepository } from '../../../infrastructure/persistence/in-memory-booking.repository';
import { BookCourtCommand } from './book-court.command';
import { BookCourtHandler } from './book-court.handler';

// Sin mocks: repositorios en memoria que cumplen los mismos puertos que los de
// drizzle. El test dice que pasa, no que metodos se llaman.
let bookings: InMemoryBookingRepository;
let events: RecordingEventBus;
let bookCourt: BookCourtHandler;
let court: Court;

const ana = UserId.of('ana@padel.local');
const day = CalendarDate.parse('2099-01-10');
const at = (text: string) => TimeOfDay.parse(text);

beforeEach(async () => {
  const clubs = new InMemoryClubRepository();
  const courts = new InMemoryCourtRepository();
  bookings = new InMemoryBookingRepository();
  events = new RecordingEventBus();
  bookCourt = new BookCourtHandler(bookings, courts, events);

  const club = Club.register(await clubs.nextId(), ClubName.of('Club Norte'));
  await clubs.save(club);
  court = Court.open(await courts.nextId(), club, CourtName.of('Pista 1'), OpeningHours.of(at('09:00'), at('22:30')));
  await courts.save(court);
});

describe('BookCourtHandler', () => {
  it('guarda la reserva', async () => {
    const booking = await bookCourt.execute(new BookCourtCommand(ana, court.id, day, at('10:30')));

    expect(await bookings.findById(booking.id)).toBe(booking);
  });

  it('publica que se ha reservado la pista', async () => {
    const booking = await bookCourt.execute(new BookCourtCommand(ana, court.id, day, at('10:30')));

    expect(events.published).toHaveLength(1);
    const event = events.published[0] as CourtWasBookedEvent;
    expect(event).toBeInstanceOf(CourtWasBookedEvent);
    expect(event.bookingId.equals(booking.id)).toBe(true);
    expect(event.userId.equals(ana)).toBe(true);
    expect(event.slot.equals(booking.slot)).toBe(true);
  });

  it('si la pista no existe, ni reserva ni evento', async () => {
    const booking = bookCourt.execute(new BookCourtCommand(ana, CourtId.of(999), day, at('10:30')));

    await expect(booking).rejects.toThrow(CourtNotFound);
    expect(events.published).toHaveLength(0);
  });

  it('si la franja ya esta reservada, ni reserva ni evento', async () => {
    await bookCourt.execute(new BookCourtCommand(ana, court.id, day, at('10:30')));

    const second = bookCourt.execute(new BookCourtCommand(UserId.of('luis@padel.local'), court.id, day, at('10:30')));

    await expect(second).rejects.toThrow(SlotAlreadyTaken);
    expect(await bookings.findByCourtAndDate(court.id, day)).toHaveLength(1);
    expect(events.published).toHaveLength(1);
  });
});
