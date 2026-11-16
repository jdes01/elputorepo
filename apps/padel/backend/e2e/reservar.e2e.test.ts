import { expect, it } from 'vitest';
import { api, daysFromNow, mailsTo, someUser } from './api';

// Un solo e2e: el flujo que da sentido a la app, con todo de verdad (la app
// compilada, Postgres y un servidor SMTP). Las reglas, la traduccion a HTTP y la
// persistencia ya tienen sus tests, mas rapidos, mas abajo en la piramide.
it('un usuario reserva una pista, la ve en sus reservas y le llega el correo', async () => {
  const user = someUser();
  const date = daysFromNow(3);

  const club = await api('POST', '/clubs', { body: { name: 'Club Norte' } });
  const court = await api('POST', `/clubs/${club.body.id}/courts`, {
    body: { name: 'Pista 1', opens: '09:00', closes: '22:30' },
  });
  const booking = await api('POST', '/bookings', { user, body: { courtId: court.body.id, date, start: '10:30' } });

  expect(booking.status).toBe(201);

  const slots = await api('GET', `/courts/${court.body.id}/availability?date=${date}`);
  expect(slots.body).toContainEqual({ start: '10:30', end: '12:00', free: false });

  const mine = await api('GET', '/me/bookings', { user });
  expect(mine.body).toMatchObject([{ date, start: '10:30', club_name: 'Club Norte', court_name: 'Pista 1' }]);

  const mails = await mailsTo(user);
  expect(mails).toHaveLength(1);
  expect(mails[0]!.Snippet).toContain(`${date} de 10:30 a 12:00`);
});
