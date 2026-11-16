import { describe, expect, it } from 'vitest';
import { api, daysFromNow, givenBooking, givenCourt, mailsTo, someUser } from './api';

describe('reservar pista', () => {
  it('reserva una franja de 90 minutos', async () => {
    const court = await givenCourt();
    const date = daysFromNow(3);

    const res = await api('POST', '/bookings', { user: someUser(), body: { courtId: court.id, date, start: '10:30' } });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ court_id: court.id, date, start: '10:30', end: '12:00' });
  });

  it('manda un correo de confirmacion a quien reserva', async () => {
    const court = await givenCourt();
    const user = someUser();
    const date = daysFromNow(3);

    await api('POST', '/bookings', { user, body: { courtId: court.id, date, start: '10:30' } });

    const mails = await mailsTo(user);
    expect(mails).toHaveLength(1);
    expect(mails[0]).toMatchObject({ Subject: 'Reserva confirmada' });
    expect(mails[0]!.Snippet).toContain(`${date} de 10:30 a 12:00`);
  });

  it('rechaza una franja que se solapa con otra reserva', async () => {
    const court = await givenCourt();
    const date = daysFromNow(3);
    await givenBooking(court.id, someUser(), date, '10:30');

    const res = await api('POST', '/bookings', { user: someUser(), body: { courtId: court.id, date, start: '11:00' } });

    expect(res.status).toBe(409);
  });

  it('permite reservar justo cuando acaba la anterior', async () => {
    const court = await givenCourt();
    const date = daysFromNow(3);
    await givenBooking(court.id, someUser(), date, '10:30');

    const res = await api('POST', '/bookings', { user: someUser(), body: { courtId: court.id, date, start: '12:00' } });

    expect(res.status).toBe(201);
  });

  it('rechaza una franja que acaba despues del cierre', async () => {
    const court = await givenCourt({ opens: '09:00', closes: '22:30' });

    const res = await api('POST', '/bookings', {
      user: someUser(),
      body: { courtId: court.id, date: daysFromNow(3), start: '21:30' },
    });

    expect(res.status).toBe(400);
  });

  it('rechaza una franja que empieza antes de abrir', async () => {
    const court = await givenCourt({ opens: '09:00', closes: '22:30' });

    const res = await api('POST', '/bookings', {
      user: someUser(),
      body: { courtId: court.id, date: daysFromNow(3), start: '08:00' },
    });

    expect(res.status).toBe(400);
  });

  it('rechaza reservar en el pasado', async () => {
    const court = await givenCourt();

    const res = await api('POST', '/bookings', {
      user: someUser(),
      body: { courtId: court.id, date: '2020-01-01', start: '10:30' },
    });

    expect(res.status).toBe(400);
  });

  it('responde 404 si la pista no existe', async () => {
    const res = await api('POST', '/bookings', {
      user: someUser(),
      body: { courtId: 999999, date: daysFromNow(3), start: '10:30' },
    });

    expect(res.status).toBe(404);
  });

  it('responde 401 sin usuario', async () => {
    const court = await givenCourt();

    const res = await api('POST', '/bookings', { body: { courtId: court.id, date: daysFromNow(3), start: '10:30' } });

    expect(res.status).toBe(401);
  });

  it('responde 400 si falta la hora de inicio', async () => {
    const court = await givenCourt();

    const res = await api('POST', '/bookings', { user: someUser(), body: { courtId: court.id, date: daysFromNow(3) } });

    expect(res.status).toBe(400);
  });

  it('responde 400 si la fecha no existe', async () => {
    const court = await givenCourt();

    const res = await api('POST', '/bookings', {
      user: someUser(),
      body: { courtId: court.id, date: '2026-02-30', start: '10:30' },
    });

    expect(res.status).toBe(400);
  });
});
