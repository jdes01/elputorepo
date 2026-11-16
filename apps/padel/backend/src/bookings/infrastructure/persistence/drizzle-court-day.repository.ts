import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';
import type { Court } from '../../../clubs/domain/entities/court.entity';
import { CourtId } from '../../../clubs/domain/value-objects/court-id.value-object';
import { toCourt } from '../../../clubs/infrastructure/persistence/drizzle-court.repository';
import { bookings, courtDays, courts } from '../../../schema';
import { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';
import { TimeSlot } from '../../../shared/domain/value-objects/time-slot.value-object';
import { DATABASE, type Database } from '../../../shared/infrastructure/database.module';
import { CourtDay } from '../../domain/aggregates/court-day.aggregate';
import { Booking } from '../../domain/entities/booking.entity';
import { CourtDayChangedMeanwhile } from '../../domain/errors/booking.errors';
import { CourtDayRepository } from '../../domain/repositories/court-day.repository';
import { BookingId } from '../../domain/value-objects/booking-id.value-object';
import { UserId } from '../../domain/value-objects/user-id.value-object';

// La agenda en Postgres: su version en court_days y sus reservas en bookings.
@Injectable()
export class DrizzleCourtDayRepository extends CourtDayRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async nextBookingId(): Promise<BookingId> {
    const { rows } = await this.db.execute<{ id: string }>(
      sql`SELECT nextval(pg_get_serial_sequence('bookings', 'id')) AS id`,
    );
    return BookingId.of(Number(rows[0]!.id));
  }

  async load(court: Court, date: CalendarDate): Promise<CourtDay> {
    const [day] = await this.db
      .select({ version: courtDays.version })
      .from(courtDays)
      .where(and(eq(courtDays.courtId, court.id.toNumber()), eq(courtDays.date, date.toString())));
    const rows = await this.db
      .select()
      .from(bookings)
      .where(and(eq(bookings.courtId, court.id.toNumber()), eq(bookings.date, date.toString())));
    return CourtDay.open(court, date, rows.map(toBooking), day?.version ?? 0);
  }

  async loadContaining(bookingId: BookingId): Promise<CourtDay | undefined> {
    const [row] = await this.db
      .select({ court: courts, date: bookings.date })
      .from(bookings)
      .innerJoin(courts, eq(courts.id, bookings.courtId))
      .where(eq(bookings.id, bookingId.toNumber()));
    return row && this.load(toCourt(row.court), CalendarDate.parse(row.date));
  }

  // Todo en una transaccion: primero se reclama la version (si otra peticion ya
  // la subio, no se actualiza ninguna fila y no se guarda nada), luego los
  // cambios. Dos peticiones que leyeron la misma version no pueden guardar las dos.
  async save(day: CourtDay): Promise<void> {
    const courtId = day.court.id.toNumber();
    const date = day.date.toString();
    await this.db.transaction(async (tx) => {
      const claimed =
        day.version === 0
          ? await tx.insert(courtDays).values({ courtId, date, version: 1 }).onConflictDoNothing().returning()
          : await tx
              .update(courtDays)
              .set({ version: day.version + 1 })
              .where(and(eq(courtDays.courtId, courtId), eq(courtDays.date, date), eq(courtDays.version, day.version)))
              .returning();
      if (claimed.length === 0) throw new CourtDayChangedMeanwhile();

      const booked = day.newBookings();
      if (booked.length > 0) await tx.insert(bookings).values(booked.map(toBookingRow));
      const cancelled = day.cancelledBookings().map((b) => b.id.toNumber());
      if (cancelled.length > 0) await tx.delete(bookings).where(inArray(bookings.id, cancelled));
    });
  }
}

function toBooking(row: typeof bookings.$inferSelect): Booking {
  return Booking.restore(
    BookingId.of(row.id),
    CourtId.of(row.courtId),
    UserId.of(row.userId),
    CalendarDate.parse(row.date),
    TimeSlot.startingAt(TimeOfDay.parse(row.start)),
  );
}

function toBookingRow(booking: Booking): typeof bookings.$inferInsert {
  return {
    id: booking.id.toNumber(),
    courtId: booking.courtId.toNumber(),
    userId: booking.userId.toString(),
    date: booking.date.toString(),
    start: booking.slot.start.toString(),
    end: booking.slot.end.toString(),
  };
}
