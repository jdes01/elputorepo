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

  it('revienta con 500 si el nombre lleva comilla simple', async () => {
    const res = await api('POST', '/clubs', { body: { name: "O'Donnell Padel" } });

    expect(res.status).toBe(500);
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
});
