import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { CourtNotFound } from '../clubs/club.errors';
import { type ClubRow, courtFromRow, type CourtRow } from '../clubs/clubs.service';
import type { Court, SlotAvailability } from '../clubs/court.entity';
import { ClubName } from '../clubs/value-objects/club-name.value-object';
import { CourtId } from '../clubs/value-objects/court-id.value-object';
import { Mailer } from '../mail.module';
import { CalendarDate } from '../shared/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../shared/value-objects/time-of-day.value-object';
import { TimeSlot } from '../shared/value-objects/time-slot.value-object';
import { Booking } from './booking.entity';
import { BookingNotFound } from './booking.errors';
import { BookingId } from './value-objects/booking-id.value-object';
import { UserId } from './value-objects/user-id.value-object';

interface BookingRow {
  id: number;
  court_id: number;
  user_id: string;
  date: string;
  start: string;
  end: string;
}

function bookingFromRow(row: BookingRow): Booking {
  return Booking.restore(
    BookingId.of(row.id),
    CourtId.of(row.court_id),
    UserId.of(row.user_id),
    CalendarDate.parse(row.date),
    TimeSlot.startingAt(TimeOfDay.parse(row.start)),
  );
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly db: Pool,
    private readonly mailer: Mailer,
  ) {}

  async book(userId: UserId, courtId: CourtId, date: CalendarDate, start: TimeOfDay): Promise<Booking> {
    const court = await this.findCourt(courtId);
    if (!court) throw new CourtNotFound();

    const booking = Booking.book({
      id: BookingId.of(await this.nextId()),
      court,
      userId,
      date,
      start,
      taken: await this.findBookingsOn(courtId, date),
      now: new Date(),
    });

    await this.db.query(
      'INSERT INTO bookings (id, court_id, user_id, date, start, "end") VALUES ($1, $2, $3, $4, $5, $6)',
      [
        booking.id.toNumber(),
        booking.courtId.toNumber(),
        booking.userId.toString(),
        booking.date.toString(),
        booking.slot.start.toString(),
        booking.slot.end.toString(),
      ],
    );
    console.log('reserva creada', booking.id.toNumber());

    // correo de confirmacion
    const club = (await this.db.query<ClubRow>('SELECT * FROM clubs WHERE id = $1', [court.clubId.toNumber()]))
      .rows[0]!;
    await this.mailer.send(
      userId.toString(),
      'Reserva confirmada',
      `<h1>Reserva confirmada</h1><p>${club.name} - ${court.name}</p><p>${date} de ${booking.slot.start} a ${booking.slot.end}</p>`,
    );

    return booking;
  }

  async cancel(userId: UserId, id: BookingId): Promise<void> {
    const row = (await this.db.query<BookingRow>('SELECT * FROM bookings WHERE id = $1', [id.toNumber()])).rows[0];
    if (!row) throw new BookingNotFound();

    bookingFromRow(row).cancel(userId, new Date());

    await this.db.query('DELETE FROM bookings WHERE id = $1', [id.toNumber()]);
    console.log('reserva cancelada', id.toNumber());
  }

  async availability(courtId: CourtId, date: CalendarDate): Promise<SlotAvailability[]> {
    const court = await this.findCourt(courtId);
    if (!court) throw new CourtNotFound();
    const bookings = await this.findBookingsOn(courtId, date);

    return court.availability(bookings.map((b) => b.slot));
  }

  async myBookings(userId: UserId): Promise<Booking[]> {
    const bookings = (
      await this.db.query<BookingRow>('SELECT * FROM bookings WHERE user_id = $1 ORDER BY date, start', [
        userId.toString(),
      ])
    ).rows.map(bookingFromRow);
    // Una consulta por reserva para su pista y otra para su club.
    /* oxlint-disable no-await-in-loop */
    for (const b of bookings) {
      const court = (await this.findCourt(b.courtId))!;
      const club = (await this.db.query<ClubRow>('SELECT * FROM clubs WHERE id = $1', [court.clubId.toNumber()]))
        .rows[0]!;
      b.courtName = court.name;
      b.clubName = ClubName.of(club.name);
    }
    /* oxlint-enable no-await-in-loop */
    return bookings;
  }

  private async findCourt(id: CourtId): Promise<Court | undefined> {
    const row = (await this.db.query<CourtRow>('SELECT * FROM courts WHERE id = $1', [id.toNumber()])).rows[0];
    return row && courtFromRow(row);
  }

  private async findBookingsOn(courtId: CourtId, date: CalendarDate): Promise<Booking[]> {
    const r = await this.db.query<BookingRow>('SELECT * FROM bookings WHERE court_id = $1 AND date = $2', [
      courtId.toNumber(),
      date.toString(),
    ]);
    return r.rows.map(bookingFromRow);
  }

  private async nextId(): Promise<number> {
    const r = await this.db.query<{ id: string }>("SELECT nextval(pg_get_serial_sequence('bookings', 'id')) AS id");
    return Number(r.rows[0]!.id);
  }
}
