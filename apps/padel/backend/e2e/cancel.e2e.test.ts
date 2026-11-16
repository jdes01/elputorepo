import { describe, expect, it } from 'vitest';
import { api, daysFromNow, givenBooking, givenCourt, slotWithinNext24h, someUser } from './api';

describe('cancelar reserva', () => {
  it('el dueno cancela con mas de 24 h y la franja queda libre', async () => {
    const court = await givenCourt();
    const user = someUser();
    const date = daysFromNow(3);
    const booking = await givenBooking(court.id, user, date, '10:30');

    const res = await api('DELETE', `/bookings/${booking.id}`, { user });

    expect(res.status).toBe(200);
    const mine = await api('GET', '/me/bookings', { user });
    expect(mine.body).toEqual([]);
    const slots = await api('GET', `/courts/${court.id}/availability?date=${date}`);
    expect(slots.body).toContainEqual({ start: '10:30', end: '12:00', free: true });
  });

  it('no deja cancelar la reserva de otro', async () => {
    const court = await givenCourt();
    const booking = await givenBooking(court.id, someUser(), daysFromNow(3), '10:30');

    const res = await api('DELETE', `/bookings/${booking.id}`, { user: someUser() });

    expect(res.status).toBe(403);
  });

  it('no deja cancelar con menos de 24 h', async () => {
    const court = await givenCourt({ opens: '00:00', closes: '23:59' });
    const user = someUser();
    const { date, start } = slotWithinNext24h();
    const booking = await givenBooking(court.id, user, date, start);

    const res = await api('DELETE', `/bookings/${booking.id}`, { user });

    expect(res.status).toBe(400);
  });

  it('responde 404 si la reserva no existe', async () => {
    const res = await api('DELETE', '/bookings/999999', { user: someUser() });

    expect(res.status).toBe(404);
  });
});
