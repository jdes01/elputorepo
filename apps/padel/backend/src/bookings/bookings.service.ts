import { HttpException, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { type ClubRow, type Court, courtFromRow, type CourtRow } from '../clubs/club.model';
import { ClubName } from '../clubs/value-objects/club-name.value-object';
import type { CourtId } from '../clubs/value-objects/court-id.value-object';
import type { CalendarDate } from '../shared/value-objects/calendar-date.value-object';
import type { TimeOfDay } from '../shared/value-objects/time-of-day.value-object';
import { Mailer } from '../mail.module';
import { TimeSlot } from '../shared/value-objects/time-slot.value-object';
import { type Booking, bookingFromRow, type BookingRow, type Slot } from './booking.model';
import type { BookingId } from './value-objects/booking-id.value-object';
import type { UserId } from './value-objects/user-id.value-object';

@Injectable()
export class BookingsService {
  constructor(
    private readonly db: Pool,
    private readonly mailer: Mailer,
  ) {}

  async book(userId: UserId, courtId: CourtId, date: CalendarDate, start: TimeOfDay): Promise<Booking> {
    const court = await this.findCourt(courtId);
    if (!court) throw new HttpException('la pista no existe', 404);

    const slot = TimeSlot.startingAt(start);

    if (!court.openingHours.contains(slot)) {
      throw new HttpException('fuera del horario de la pista', 400);
    }

    if (date.at(slot.start) < new Date()) {
      throw new HttpException('no se puede reservar en el pasado', 400);
    }

    const existing = await this.findBookingsOn(courtId, date);
    if (existing.some((b) => b.slot.overlaps(slot))) {
      throw new HttpException('la pista ya esta reservada a esa hora', 409);
    }

    const r = await this.db.query<BookingRow>(
      'INSERT INTO bookings (court_id, user_id, date, start, "end") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [courtId.toNumber(), userId.toString(), date.toString(), slot.start.toString(), slot.end.toString()],
    );
    console.log('reserva creada', r.rows[0]);

    // correo de confirmacion
    const club = (await this.db.query<ClubRow>('SELECT * FROM clubs WHERE id = $1', [court.clubId.toNumber()]))
      .rows[0]!;
    await this.mailer.send(
      userId.toString(),
      'Reserva confirmada',
      `<h1>Reserva confirmada</h1><p>${club.name} - ${court.name}</p><p>${date} de ${slot.start} a ${slot.end}</p>`,
    );

    return bookingFromRow(r.rows[0]!);
  }

  async cancel(userId: UserId, id: BookingId): Promise<void> {
    const row = (await this.db.query<BookingRow>('SELECT * FROM bookings WHERE id = $1', [id.toNumber()])).rows[0];
    if (!row) throw new HttpException('la reserva no existe', 404);
    const b = bookingFromRow(row);
    if (!b.userId.equals(userId)) throw new HttpException('no es tu reserva', 403);

    const hours = (b.date.at(b.slot.start).getTime() - Date.now()) / 1000 / 60 / 60;
    if (hours < 24) throw new HttpException('solo se cancela con 24h de antelacion', 400);

    await this.db.query('DELETE FROM bookings WHERE id = $1', [id.toNumber()]);
    console.log('reserva cancelada', id.toNumber());
  }

  async availability(courtId: CourtId, date: CalendarDate): Promise<Slot[]> {
    const court = await this.findCourt(courtId);
    if (!court) throw new Error('la pista no existe');
    const bookings = await this.findBookingsOn(courtId, date);

    return court.openingHours.slots().map((slot) => ({ slot, free: !bookings.some((b) => b.slot.overlaps(slot)) }));
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
}
