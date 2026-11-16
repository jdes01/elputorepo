import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type HttpApp, startHttpApp } from './http-app';

let app: HttpApp;
beforeAll(async () => {
  app = await startHttpApp();
});
afterAll(() => app.close());

const givenClub = async (name = 'Club Norte') => (await app.call('POST', '/clubs', { body: { name } })).body;

describe('POST /clubs', () => {
  it('201 con el club, que aparece en GET /clubs', async () => {
    const created = await app.call('POST', '/clubs', { body: { name: 'Club Sur' } });

    expect(created.status).toBe(201);
    expect(created.body).toEqual({ id: expect.any(Number), name: 'Club Sur' });
    expect((await app.call('GET', '/clubs')).body).toContainEqual(created.body);
  });

  it('400 si el nombre viene vacio', async () => {
    const res = await app.call('POST', '/clubs', { body: { name: '  ' } });

    expect(res.status).toBe(400);
  });
});

describe('POST /clubs/:clubId/courts', () => {
  it('201 con la pista, que aparece en las pistas del club', async () => {
    const club = await givenClub();

    const created = await app.call('POST', `/clubs/${club.id}/courts`, {
      body: { name: 'Pista central', opens: '08:00', closes: '23:00' },
    });

    expect(created.status).toBe(201);
    expect(created.body).toEqual({
      id: expect.any(Number),
      club_id: club.id,
      name: 'Pista central',
      opens: '08:00',
      closes: '23:00',
    });
    expect((await app.call('GET', `/clubs/${club.id}/courts`)).body).toEqual([created.body]);
  });

  it('400 si una hora no tiene formato HH:MM', async () => {
    const club = await givenClub();

    const res = await app.call('POST', `/clubs/${club.id}/courts`, {
      body: { name: 'P', opens: '9', closes: '22:00' },
    });

    expect(res.status).toBe(400);
  });

  it('400 si la pista cierra antes de abrir', async () => {
    const club = await givenClub();

    const res = await app.call('POST', `/clubs/${club.id}/courts`, {
      body: { name: 'P', opens: '22:00', closes: '09:00' },
    });

    expect(res.status).toBe(400);
  });

  it('404 si el club no existe', async () => {
    const res = await app.call('POST', '/clubs/999999/courts', {
      body: { name: 'P', opens: '09:00', closes: '22:00' },
    });

    expect(res.status).toBe(404);
  });
});

describe('GET /clubs/:clubId/courts', () => {
  it('400 si el id del club no es un numero', async () => {
    expect((await app.call('GET', '/clubs/abc/courts')).status).toBe(400);
  });
});
