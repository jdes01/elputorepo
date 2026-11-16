import { eq, isNull } from 'drizzle-orm';
import { CourtWasOpenedEvent } from '../../../clubs/domain/events/court-was-opened.event';
import { ClubId } from '../../../clubs/domain/value-objects/club-id.value-object';
import { ClubName } from '../../../clubs/domain/value-objects/club-name.value-object';
import { CourtId } from '../../../clubs/domain/value-objects/court-id.value-object';
import { CourtName } from '../../../clubs/domain/value-objects/court-name.value-object';
import { OpeningHours } from '../../../clubs/domain/value-objects/opening-hours.value-object';
import { bookings, clubs, courts } from '../../../schema';
import { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';
import { TimeSlot } from '../../../shared/domain/value-objects/time-slot.value-object';
import type { Database } from '../../../shared/infrastructure/database.module';
import { CourtWasBookedEvent } from '../../domain/events/court-was-booked.event';
import { BookingId } from '../../domain/value-objects/booking-id.value-object';
import { UserId } from '../../domain/value-objects/user-id.value-object';
import type { MongoReadModelProjector } from './mongo-read-model.projector';

// Tira el modelo de lectura y lo rehace desde Postgres, que es la fuente de
// verdad: se pasa al proyector un evento por cada pista y por cada reserva
// activa, como si acabaran de pasar. Primero las pistas, porque las reservas
// necesitan sus nombres.
export async function rebuildReadModel(db: Database, projector: MongoReadModelProjector) {
  await projector.clear();
  const now = new Date();

  const courtRows = await db
    .select({ court: courts, clubName: clubs.name })
    .from(courts)
    .innerJoin(clubs, eq(clubs.id, courts.clubId));
  await Promise.all(
    courtRows.map(({ court, clubName }) =>
      projector.courtWasOpened(
        new CourtWasOpenedEvent(
          CourtId.of(court.id),
          ClubId.of(court.clubId),
          CourtName.of(court.name),
          ClubName.of(clubName),
          OpeningHours.of(TimeOfDay.parse(court.opens), TimeOfDay.parse(court.closes)),
          now,
        ),
      ),
    ),
  );

  const bookingRows = await db.select().from(bookings).where(isNull(bookings.cancelledAt));
  await Promise.all(
    bookingRows.map((row) =>
      projector.courtWasBooked(
        new CourtWasBookedEvent(
          BookingId.of(row.id),
          CourtId.of(row.courtId),
          UserId.of(row.userId),
          CalendarDate.parse(row.date),
          TimeSlot.startingAt(TimeOfDay.parse(row.start)),
          now,
        ),
      ),
    ),
  );

  return { courts: courtRows.length, bookings: bookingRows.length };
}
