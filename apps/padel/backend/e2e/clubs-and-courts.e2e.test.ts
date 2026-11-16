import { describe, expect, it } from 'vitest';
import { api, givenClub } from './api';

describe('crear club', () => {
  it('lo crea y aparece en el listado', async () => {
    const created = await api('POST', '/clubs', { body: { name: 'Club Sur' } });

    expect(created.status).toBe(201);
    expect(created.body).toEqual({ id: expect.any(Number), name: 'Club Sur' });
    const list = await api('GET', '/clubs');
    expect(list.body).toContainEqual(created.body);
  });

  it('acepta nombres con comilla simple', async () => {
    const res = await api('POST', '/clubs', { body: { name: "O'Donnell Padel" } });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("O'Donnell Padel");
  });

  it('responde 400 si el nombre viene vacio', async () => {
    const res = await api('POST', '/clubs', { body: { name: '  ' } });

    expect(res.status).toBe(400);
  });
});

describe('crear pista', () => {
  it('la crea en el club y aparece en sus pistas', async () => {
    const club = await givenClub();

    const created = await api('POST', `/clubs/${club.id}/courts`, {
      body: { name: 'Pista central', opens: '08:00', closes: '23:00' },
    });

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ name: 'Pista central', opens: '08:00', closes: '23:00' });
    const list = await api('GET', `/clubs/${club.id}/courts`);
    expect(list.body).toEqual([created.body]);
  });

  it('responde 400 si la hora de apertura no tiene formato HH:MM', async () => {
    const club = await givenClub();

    const res = await api('POST', `/clubs/${club.id}/courts`, { body: { name: 'Pista', opens: '9', closes: '22:00' } });

    expect(res.status).toBe(400);
  });

  it('responde 400 si la pista cierra antes de abrir', async () => {
    const club = await givenClub();

    const res = await api('POST', `/clubs/${club.id}/courts`, {
      body: { name: 'Pista', opens: '22:00', closes: '09:00' },
    });

    expect(res.status).toBe(400);
  });

  it('revienta con 500 si el club no existe', async () => {
    const res = await api('POST', '/clubs/999999/courts', { body: { name: 'Pista', opens: '09:00', closes: '22:00' } });

    expect(res.status).toBe(500);
  });

  it('responde 400 si el id del club no es un numero', async () => {
    const res = await api('GET', '/clubs/abc/courts');

    expect(res.status).toBe(400);
  });
});
