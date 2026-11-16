import { describe, expect, it } from 'vitest';
import { api, daysFromNow, givenBooking, givenCourt, someUser } from './api';

describe('ver disponibilidad', () => {
  it('divide el horario en franjas de 90 minutos y marca las ocupadas', async () => {
    const court = await givenCourt({ opens: '09:00', closes: '15:00' });
    const date = daysFromNow(3);
    await givenBooking(court.id, someUser(), date, '10:30');

    const res = await api('GET', `/courts/${court.id}/availability?date=${date}`);

    expect(res.body).toEqual([
      { start: '09:00', end: '10:30', free: true },
      { start: '10:30', end: '12:00', free: false },
      { start: '12:00', end: '13:30', free: true },
      { start: '13:30', end: '15:00', free: true },
    ]);
  });

  it('responde 400 sin fecha', async () => {
    const court = await givenCourt();

    const res = await api('GET', `/courts/${court.id}/availability`);

    expect(res.status).toBe(400);
  });

  it('responde 404 si la pista no existe', async () => {
    const res = await api('GET', `/courts/999999/availability?date=${daysFromNow(3)}`);

    expect(res.status).toBe(404);
  });
});

describe('ver mis reservas', () => {
  it('lista solo las mias, con club y pista, por fecha y hora', async () => {
    const court = await givenCourt();
    const me = someUser();
    await givenBooking(court.id, me, daysFromNow(4), '09:00');
    await givenBooking(court.id, me, daysFromNow(3), '12:00');
    await givenBooking(court.id, someUser(), daysFromNow(3), '15:00');

    const res = await api('GET', '/me/bookings', { user: me });

    expect(res.body).toMatchObject([
      { date: daysFromNow(3), start: '12:00', club_name: 'Club Norte', court_name: 'Pista 1' },
      { date: daysFromNow(4), start: '09:00', club_name: 'Club Norte', court_name: 'Pista 1' },
    ]);
  });

  it('responde 401 sin usuario', async () => {
    const res = await api('GET', '/me/bookings');

    expect(res.status).toBe(401);
  });
});
