import { randomUUID } from 'node:crypto';
import { Booking } from '../src/bookings/domain/entities/booking.entity';
import { UserId } from '../src/bookings/domain/value-objects/user-id.value-object';
import { DrizzleBookingRepository } from '../src/bookings/infrastructure/persistence/drizzle-booking.repository';
import { Club } from '../src/clubs/domain/entities/club.entity';
import { Court } from '../src/clubs/domain/entities/court.entity';
import { ClubName } from '../src/clubs/domain/value-objects/club-name.value-object';
import { CourtName } from '../src/clubs/domain/value-objects/court-name.value-object';
import { OpeningHours } from '../src/clubs/domain/value-objects/opening-hours.value-object';
import { DrizzleClubRepository } from '../src/clubs/infrastructure/persistence/drizzle-club.repository';
import { DrizzleCourtRepository } from '../src/clubs/infrastructure/persistence/drizzle-court.repository';
import { CalendarDate } from '../src/shared/domain/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../src/shared/domain/value-objects/time-of-day.value-object';
import type { Database } from '../src/shared/infrastructure/database.module';

// Datos de partida para los tests de lectura, escritos con el lado de escritura.
export function seed(db: Database) {
  const clubs = new DrizzleClubRepository(db);
  const courts = new DrizzleCourtRepository(db);
  const bookings = new DrizzleBookingRepository(db);

  return {
    someUser: () => UserId.of(`${randomUUID()}@padel.local`),

    async club(name = 'Club Norte') {
      const club = Club.register(await clubs.nextId(), ClubName.of(name));
      await clubs.save(club);
      return club;
    },

    async court(club: Club, { name = 'Pista 1', opens = '09:00', closes = '22:30' } = {}) {
      const hours = OpeningHours.of(TimeOfDay.parse(opens), TimeOfDay.parse(closes));
      const court = Court.open(await courts.nextId(), club, CourtName.of(name), hours);
      await courts.save(court);
      return court;
    },

    async booking(court: Court, userId: UserId, on: string, at: string) {
      const booking = Booking.book({
        id: await bookings.nextId(),
        court,
        userId,
        date: CalendarDate.parse(on),
        start: TimeOfDay.parse(at),
        taken: [],
        now: new Date('2026-01-01'),
      });
      await bookings.save(booking);
      return booking;
    },
  };
}
