import { HttpException, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import type { Court } from '../clubs/club.model';
import { Mailer } from '../mail.module';
import type { Booking, Slot } from './booking.model';

@Injectable()
export class BookingsService {
  constructor(
    private readonly db: Pool,
    private readonly mailer: Mailer,
  ) {}

  async book(userId: string, courtId: number, date: string, start: string): Promise<Booking> {
    if (!userId) throw new HttpException('falta x-user-id', 401);

    const court = (await this.db.query<Court>('SELECT * FROM courts WHERE id = $1', [courtId])).rows[0];
    if (!court) throw new HttpException('la pista no existe', 404);

    // 90 minutos, a mano. El contrato garantiza "HH:MM", asi que se lee por posicion.
    const h = Number(start.slice(0, 2));
    const min = Number(start.slice(3, 5));
    const endMin = h * 60 + min + 90;
    const end = String(Math.floor(endMin / 60)).padStart(2, '0') + ':' + String(endMin % 60).padStart(2, '0');

    if (start < court.opens || end > court.closes) {
      throw new HttpException('fuera del horario de la pista', 400);
    }

    if (new Date(date + 'T' + start) < new Date()) {
      throw new HttpException('no se puede reservar en el pasado', 400);
    }

    const existing = (
      await this.db.query<Booking>('SELECT * FROM bookings WHERE court_id = $1 AND date = $2', [courtId, date])
    ).rows;
    for (const b of existing) {
      if (b.start < end && b.end > start) {
        throw new HttpException('la pista ya esta reservada a esa hora', 409);
      }
    }

    const r = await this.db.query<Booking>(
      'INSERT INTO bookings (court_id, user_id, date, start, "end") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [courtId, userId, date, start, end],
    );
    console.log('reserva creada', r.rows[0]);

    // correo de confirmacion
    const info = (
      await this.db.query<{ court: string; club: string }>(
        'SELECT c.name AS court, cl.name AS club FROM courts c JOIN clubs cl ON cl.id = c.club_id WHERE c.id = $1',
        [courtId],
      )
    ).rows[0]!;
    await this.mailer.send(
      userId,
      'Reserva confirmada',
      `<h1>Reserva confirmada</h1><p>${info.club} - ${info.court}</p><p>${date} de ${start} a ${end}</p>`,
    );

    return r.rows[0]!;
  }

  async cancel(userId: string, id: number): Promise<void> {
    if (!userId) throw new HttpException('falta x-user-id', 401);

    const b = (await this.db.query<Booking>('SELECT * FROM bookings WHERE id = $1', [id])).rows[0];
    if (!b) throw new HttpException('la reserva no existe', 404);
    if (b.user_id !== userId) throw new HttpException('no es tu reserva', 403);

    const hours = (new Date(b.date + 'T' + b.start).getTime() - Date.now()) / 1000 / 60 / 60;
    if (hours < 24) throw new HttpException('solo se cancela con 24h de antelacion', 400);

    await this.db.query('DELETE FROM bookings WHERE id = $1', [id]);
    console.log('reserva cancelada', id);
  }

  async availability(courtId: number, date: string): Promise<Slot[]> {
    const court = (await this.db.query<Court>('SELECT * FROM courts WHERE id = $1', [courtId])).rows[0];
    if (!court) throw new Error('la pista no existe');
    const bookings = (
      await this.db.query<Booking>('SELECT * FROM bookings WHERE court_id = $1 AND date = $2', [courtId, date])
    ).rows;

    const slots: Slot[] = [];
    let m = parseInt(court.opens.split(':')[0]!) * 60 + parseInt(court.opens.split(':')[1]!);
    const closes = parseInt(court.closes.split(':')[0]!) * 60 + parseInt(court.closes.split(':')[1]!);
    while (m + 90 <= closes) {
      const start = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
      const end = String(Math.floor((m + 90) / 60)).padStart(2, '0') + ':' + String((m + 90) % 60).padStart(2, '0');
      const taken = bookings.find((b) => b.start < end && b.end > start);
      slots.push({ start, end, free: !taken });
      m += 90;
    }
    return slots;
  }

  async myBookings(userId: string): Promise<Booking[]> {
    if (!userId) throw new HttpException('falta x-user-id', 401);

    const bookings = (
      await this.db.query<Booking>('SELECT * FROM bookings WHERE user_id = $1 ORDER BY date, start', [userId])
    ).rows;
    // Una consulta por reserva para su pista y otra para su club.
    /* oxlint-disable no-await-in-loop */
    for (const b of bookings) {
      const court = (await this.db.query<Court>('SELECT * FROM courts WHERE id = $1', [b.court_id])).rows[0]!;
      const club = (await this.db.query<{ name: string }>('SELECT * FROM clubs WHERE id = $1', [court.club_id]))
        .rows[0]!;
      b.court_name = court.name;
      b.club_name = club.name;
    }
    /* oxlint-enable no-await-in-loop */
    return bookings;
  }
}
