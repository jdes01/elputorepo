import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, sql } from 'drizzle-orm';
import { CourtId } from '../clubs/value-objects/court-id.value-object';
import { DATABASE, type Database } from '../database.module';
import { bookings } from '../schema';
import { CalendarDate } from '../shared/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../shared/value-objects/time-of-day.value-object';
import { TimeSlot } from '../shared/value-objects/time-slot.value-object';
import { Booking } from './booking.entity';
import { BookingRepository } from './booking.repository';
import { BookingId } from './value-objects/booking-id.value-object';
import { UserId } from './value-objects/user-id.value-object';

@Injectable()
export class DrizzleBookingRepository extends BookingRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async nextId(): Promise<BookingId> {
    const { rows } = await this.db.execute<{ id: string }>(
      sql`SELECT nextval(pg_get_serial_sequence('bookings', 'id')) AS id`,
    );
    return BookingId.of(Number(rows[0]!.id));
  }

  async save(booking: Booking): Promise<void> {
    await this.db.insert(bookings).values({
      id: booking.id.toNumber(),
      courtId: booking.courtId.toNumber(),
      userId: booking.userId.toString(),
      date: booking.date.toString(),
      start: booking.slot.start.toString(),
      end: booking.slot.end.toString(),
    });
  }

  async remove(booking: Booking): Promise<void> {
    await this.db.delete(bookings).where(eq(bookings.id, booking.id.toNumber()));
  }

  async findById(id: BookingId): Promise<Booking | undefined> {
    const [row] = await this.db.select().from(bookings).where(eq(bookings.id, id.toNumber()));
    return row && toBooking(row);
  }

  async findByCourtAndDate(courtId: CourtId, date: CalendarDate): Promise<Booking[]> {
    const rows = await this.db
      .select()
      .from(bookings)
      .where(and(eq(bookings.courtId, courtId.toNumber()), eq(bookings.date, date.toString())));
    return rows.map(toBooking);
  }

  async findByUser(userId: UserId): Promise<Booking[]> {
    const rows = await this.db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId.toString()))
      .orderBy(asc(bookings.date), asc(bookings.start));
    return rows.map(toBooking);
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
