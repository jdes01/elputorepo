import { afterAll, describe, expect, it } from 'vitest';
import { testDatabase } from '../../../../integration/database';
import { seed } from '../../../../integration/seed';
import { DrizzleClubsFinder } from './drizzle-clubs.finder';
import { DrizzleCourtsFinder } from './drizzle-courts.finder';

const { db, close } = testDatabase();
const given = seed(db);
afterAll(close);

describe('DrizzleClubsFinder', () => {
  it('da todos los clubs, en orden de alta', async () => {
    const first = await given.club('Club Uno');
    const second = await given.club('Club Dos');

    const all = await new DrizzleClubsFinder(db).all();

    const ids = all.map((c) => c.id);
    expect(ids.indexOf(first.id.toNumber())).toBeLessThan(ids.indexOf(second.id.toNumber()));
    expect(all).toContainEqual({ id: first.id.toNumber(), name: 'Club Uno' });
  });
});

describe('DrizzleCourtsFinder', () => {
  it('da solo las pistas del club, en orden de alta, con su horario', async () => {
    const club = await given.club();
    const first = await given.court(club, { name: 'Pista 1', opens: '08:00', closes: '23:00' });
    const second = await given.court(club, { name: 'Pista 2' });
    await given.court(await given.club('Otro club'));

    const courts = await new DrizzleCourtsFinder(db).ofClub(club.id);

    expect(courts).toEqual([
      { id: first.id.toNumber(), clubId: club.id.toNumber(), name: 'Pista 1', opens: '08:00', closes: '23:00' },
      { id: second.id.toNumber(), clubId: club.id.toNumber(), name: 'Pista 2', opens: '09:00', closes: '22:30' },
    ]);
  });
});
