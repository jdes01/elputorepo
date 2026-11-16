import { Body, Controller, Delete, Get, Headers, HttpException, Param, Post, Query } from '@nestjs/common';
import {
  bookCourt,
  cancelBooking,
  createClub,
  createCourt,
  getAvailability,
  listCourts,
  type Booking,
  type Club,
  type Court,
  type MyBooking,
  type Slot,
} from '@padel/contracts';
import { createTransport } from 'nodemailer';
import { Pool } from 'pg';
import type { z } from 'zod';
import { loadConfig } from './config';
import { ZodPipe } from './zod.pipe';

export const db = new Pool({ connectionString: loadConfig().databaseUrl });
const mailer = createTransport(loadConfig().smtpUrl);

@Controller()
export class AppController {
  // ---------- clubs ----------

  @Post('clubs')
  async createClub(@Body(new ZodPipe(createClub.body)) body: z.output<typeof createClub.body>): Promise<Club> {
    const r = await db.query('INSERT INTO clubs (name) VALUES ($1) RETURNING *', [body.name]);
    console.log('club creado', r.rows[0]);
    return r.rows[0];
  }

  @Get('clubs')
  async listClubs(): Promise<Club[]> {
    const r = await db.query('SELECT * FROM clubs ORDER BY id');
    return r.rows;
  }

  // ---------- courts ----------

  @Post('clubs/:clubId/courts')
  async createCourt(
    @Param(new ZodPipe(createCourt.params)) { clubId }: z.output<typeof createCourt.params>,
    @Body(new ZodPipe(createCourt.body)) body: z.output<typeof createCourt.body>,
  ): Promise<Court> {
    const r = await db.query('INSERT INTO courts (club_id, name, opens, closes) VALUES ($1, $2, $3, $4) RETURNING *', [
      clubId,
      body.name,
      body.opens,
      body.closes,
    ]);
    console.log('pista creada', r.rows[0]);
    return r.rows[0];
  }

  @Get('clubs/:clubId/courts')
  async listCourts(
    @Param(new ZodPipe(listCourts.params)) { clubId }: z.output<typeof listCourts.params>,
  ): Promise<Court[]> {
    const r = await db.query('SELECT * FROM courts WHERE club_id = $1 ORDER BY id', [clubId]);
    return r.rows;
  }

  // ---------- availability ----------

  @Get('courts/:courtId/availability')
  async availability(
    @Param(new ZodPipe(getAvailability.params)) { courtId }: z.output<typeof getAvailability.params>,
    @Query(new ZodPipe(getAvailability.query)) { date }: z.output<typeof getAvailability.query>,
  ): Promise<Slot[]> {
    const court = (await db.query('SELECT * FROM courts WHERE id = $1', [courtId])).rows[0];
    const bookings = (await db.query('SELECT * FROM bookings WHERE court_id = $1 AND date = $2', [courtId, date])).rows;

    const slots: Slot[] = [];
    let m = parseInt(court.opens.split(':')[0]) * 60 + parseInt(court.opens.split(':')[1]);
    const closes = parseInt(court.closes.split(':')[0]) * 60 + parseInt(court.closes.split(':')[1]);
    while (m + 90 <= closes) {
      const start = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
      const end = String(Math.floor((m + 90) / 60)).padStart(2, '0') + ':' + String((m + 90) % 60).padStart(2, '0');
      const taken = bookings.find((b) => b.start < end && b.end > start);
      slots.push({ start, end, free: !taken });
      m += 90;
    }
    return slots;
  }

  // ---------- bookings ----------

  @Post('bookings')
  async book(
    @Headers('x-user-id') userId: string,
    @Body(new ZodPipe(bookCourt.body)) body: z.output<typeof bookCourt.body>,
  ): Promise<Booking> {
    if (!userId) throw new HttpException('falta x-user-id', 401);

    const court = (await db.query('SELECT * FROM courts WHERE id = $1', [body.courtId])).rows[0];
    if (!court) throw new HttpException('la pista no existe', 404);

    // 90 minutos, a mano. El contrato garantiza "HH:MM", asi que se lee por posicion.
    const h = Number(body.start.slice(0, 2));
    const min = Number(body.start.slice(3, 5));
    const endMin = h * 60 + min + 90;
    const end = String(Math.floor(endMin / 60)).padStart(2, '0') + ':' + String(endMin % 60).padStart(2, '0');

    if (body.start < court.opens || end > court.closes) {
      throw new HttpException('fuera del horario de la pista', 400);
    }

    if (new Date(body.date + 'T' + body.start) < new Date()) {
      throw new HttpException('no se puede reservar en el pasado', 400);
    }

    const existing = (
      await db.query('SELECT * FROM bookings WHERE court_id = $1 AND date = $2', [body.courtId, body.date])
    ).rows;
    for (const b of existing) {
      if (b.start < end && b.end > body.start) {
        throw new HttpException('la pista ya esta reservada a esa hora', 409);
      }
    }

    const r = await db.query(
      'INSERT INTO bookings (court_id, user_id, date, start, "end") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [body.courtId, userId, body.date, body.start, end],
    );
    console.log('reserva creada', r.rows[0]);

    // correo de confirmacion
    const info = (
      await db.query(
        'SELECT c.name AS court, cl.name AS club FROM courts c JOIN clubs cl ON cl.id = c.club_id WHERE c.id = $1',
        [body.courtId],
      )
    ).rows[0];
    await mailer.sendMail({
      from: 'reservas@padel.local',
      to: userId,
      subject: 'Reserva confirmada',
      html: `<h1>Reserva confirmada</h1><p>${info.club} - ${info.court}</p><p>${body.date} de ${body.start} a ${end}</p>`,
    });

    return r.rows[0];
  }

  @Delete('bookings/:id')
  async cancel(
    @Headers('x-user-id') userId: string,
    @Param(new ZodPipe(cancelBooking.params)) { id }: z.output<typeof cancelBooking.params>,
  ): Promise<{ ok: true }> {
    if (!userId) throw new HttpException('falta x-user-id', 401);

    const b = (await db.query('SELECT * FROM bookings WHERE id = $1', [id])).rows[0];
    if (!b) throw new HttpException('la reserva no existe', 404);
    if (b.user_id !== userId) throw new HttpException('no es tu reserva', 403);

    const hours = (new Date(b.date + 'T' + b.start).getTime() - Date.now()) / 1000 / 60 / 60;
    if (hours < 24) throw new HttpException('solo se cancela con 24h de antelacion', 400);

    await db.query('DELETE FROM bookings WHERE id = $1', [id]);
    console.log('reserva cancelada', id);
    return { ok: true as const };
  }

  @Get('me/bookings')
  async myBookings(@Headers('x-user-id') userId: string): Promise<MyBooking[]> {
    if (!userId) throw new HttpException('falta x-user-id', 401);

    const r = await db.query(
      `SELECT b.*, c.name AS court_name, cl.name AS club_name
       FROM bookings b JOIN courts c ON c.id = b.court_id JOIN clubs cl ON cl.id = c.club_id
       WHERE b.user_id = $1 ORDER BY b.date, b.start`,
      [userId],
    );
    return r.rows;
  }
}
