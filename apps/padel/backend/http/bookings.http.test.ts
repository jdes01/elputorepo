import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type HttpApp, startHttpApp } from './http-app';

let app: HttpApp;
beforeAll(async () => {
  app = await startHttpApp();
});
afterAll(() => app.close());

const someUser = () => `${randomUUID()}@padel.local`;
const DAY = '2099-01-10';

async function givenCourt() {
  const club = (await app.call('POST', '/clubs', { body: { name: 'Club Norte' } })).body;
  const body = { name: 'Pista 1', opens: '09:00', closes: '22:30' };
  return (await app.call('POST', `/clubs/${club.id}/courts`, { body })).body;
}

const book = (courtId: number, user: string | undefined, start = '10:30', date = DAY) =>
  app.call('POST', '/bookings', { user, body: { courtId, date, start } });

describe('POST /bookings', () => {
  it('201 con la reserva, y manda el correo', async () => {
    const court = await givenCourt();
    const user = someUser();

    const res = await book(court.id, user);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: expect.any(Number),
      court_id: court.id,
      user_id: user,
      date: DAY,
      start: '10:30',
      end: '12:00',
    });
    expect(app.mailer.sent.filter((mail) => mail.to === user)).toHaveLength(1);
  });

  it('si el correo no sale, la reserva es 201 igual', async () => {
    const court = await givenCourt();
    const user = someUser();
    app.mailer.down = true;

    const res = await book(court.id, user);
    app.mailer.down = false;

    expect(res.status).toBe(201);
    expect(app.mailer.sent.filter((mail) => mail.to === user)).toHaveLength(0);
  });

  it('409 si la franja ya esta reservada', async () => {
    const court = await givenCourt();
    await book(court.id, someUser());

    expect((await book(court.id, someUser())).status).toBe(409);
  });

  it('400 si es en el pasado', async () => {
    const court = await givenCourt();

    expect((await book(court.id, someUser(), '10:30', '2020-01-01')).status).toBe(400);
  });

  it('404 si la pista no existe', async () => {
    expect((await book(999999, someUser())).status).toBe(404);
  });

  it('401 sin usuario', async () => {
    const court = await givenCourt();

    expect((await book(court.id, undefined)).status).toBe(401);
  });

  it('400 si falta la hora de inicio o la fecha no existe', async () => {
    const court = await givenCourt();
    const user = someUser();

    expect((await app.call('POST', '/bookings', { user, body: { courtId: court.id, date: DAY } })).status).toBe(400);
    expect((await book(court.id, user, '10:30', '2026-02-30')).status).toBe(400);
  });
});

describe('DELETE /bookings/:id', () => {
  it('200, y la franja vuelve a estar libre', async () => {
    const court = await givenCourt();
    const user = someUser();
    const booking = (await book(court.id, user)).body;

    const res = await app.call('DELETE', `/bookings/${booking.id}`, { user });

    expect(res.status).toBe(200);
    const slots = (await app.call('GET', `/courts/${court.id}/availability?date=${DAY}`)).body;
    expect(slots).toContainEqual({ start: '10:30', end: '12:00', free: true });
  });

  it('403 si la reserva es de otro', async () => {
    const court = await givenCourt();
    const booking = (await book(court.id, someUser())).body;

    expect((await app.call('DELETE', `/bookings/${booking.id}`, { user: someUser() })).status).toBe(403);
  });

  it('404 si la reserva no existe', async () => {
    expect((await app.call('DELETE', '/bookings/999999', { user: someUser() })).status).toBe(404);
  });

  it('401 sin usuario', async () => {
    expect((await app.call('DELETE', '/bookings/1')).status).toBe(401);
  });
});

describe('GET /courts/:courtId/availability', () => {
  it('la rejilla del dia con las franjas ocupadas', async () => {
    const court = await givenCourt();
    await book(court.id, someUser(), '10:30');

    const res = await app.call('GET', `/courts/${court.id}/availability?date=${DAY}`);

    expect(res.status).toBe(200);
    expect(res.body.slice(0, 3)).toEqual([
      { start: '09:00', end: '10:30', free: true },
      { start: '10:30', end: '12:00', free: false },
      { start: '12:00', end: '13:30', free: true },
    ]);
  });

  it('400 sin fecha', async () => {
    const court = await givenCourt();

    expect((await app.call('GET', `/courts/${court.id}/availability`)).status).toBe(400);
  });

  it('404 si la pista no existe', async () => {
    expect((await app.call('GET', `/courts/999999/availability?date=${DAY}`)).status).toBe(404);
  });
});

describe('GET /me/bookings', () => {
  it('las mias, con pista y club, por fecha y hora', async () => {
    const court = await givenCourt();
    const me = someUser();
    await book(court.id, me, '09:00', '2099-01-11');
    await book(court.id, me, '12:00', DAY);
    await book(court.id, someUser(), '15:00', DAY);

    const res = await app.call('GET', '/me/bookings', { user: me });

    expect(res.body).toMatchObject([
      { date: DAY, start: '12:00', club_name: 'Club Norte', court_name: 'Pista 1' },
      { date: '2099-01-11', start: '09:00', club_name: 'Club Norte', court_name: 'Pista 1' },
    ]);
  });

  it('401 sin usuario', async () => {
    expect((await app.call('GET', '/me/bookings')).status).toBe(401);
  });
});
