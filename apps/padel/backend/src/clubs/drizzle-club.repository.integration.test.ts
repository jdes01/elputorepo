import { afterAll, describe, expect, it } from 'vitest';
import { testDatabase } from '../../integration/database';
import { TimeOfDay } from '../shared/value-objects/time-of-day.value-object';
import { Club } from './club.entity';
import { Court } from './court.entity';
import { DrizzleClubRepository } from './drizzle-club.repository';
import { DrizzleCourtRepository } from './drizzle-court.repository';
import { ClubName } from './value-objects/club-name.value-object';
import { CourtName } from './value-objects/court-name.value-object';
import { OpeningHours } from './value-objects/opening-hours.value-object';

const { db, close } = testDatabase();
const clubs = new DrizzleClubRepository(db);
const courts = new DrizzleCourtRepository(db);
afterAll(close);

async function givenClub(name = 'Club Norte') {
  const club = Club.register(await clubs.nextId(), ClubName.of(name));
  await clubs.save(club);
  return club;
}

async function givenCourt(club: Club, name = 'Pista 1') {
  const hours = OpeningHours.of(TimeOfDay.parse('09:00'), TimeOfDay.parse('22:30'));
  const court = Court.open(await courts.nextId(), club, CourtName.of(name), hours);
  await courts.save(court);
  return court;
}

describe('DrizzleClubRepository', () => {
  it('cada club nace con un id distinto', async () => {
    const [a, b] = await Promise.all([clubs.nextId(), clubs.nextId()]);

    expect(a.equals(b)).toBe(false);
  });

  it('guarda un club y lo devuelve igual', async () => {
    const club = await givenClub("O'Donnell Padel");

    const found = await clubs.findById(club.id);

    expect(found?.equals(club)).toBe(true);
    expect(found?.name.equals(club.name)).toBe(true);
  });

  it('no encuentra un club que no existe', async () => {
    const id = await clubs.nextId();

    expect(await clubs.findById(id)).toBeUndefined();
  });
});

describe('DrizzleCourtRepository', () => {
  it('guarda una pista y la devuelve con su horario', async () => {
    const court = await givenCourt(await givenClub());

    const found = await courts.findById(court.id);

    expect(found?.equals(court)).toBe(true);
    expect(found?.openingHours.equals(court.openingHours)).toBe(true);
  });

  it('lista solo las pistas del club, en orden de alta', async () => {
    const club = await givenClub();
    const first = await givenCourt(club, 'Pista 1');
    const second = await givenCourt(club, 'Pista 2');
    await givenCourt(await givenClub('Otro club'));

    const found = await courts.findByClub(club.id);

    expect(found.map((c) => c.name.toString())).toEqual(['Pista 1', 'Pista 2']);
    expect(found[0]?.equals(first) && found[1]?.equals(second)).toBe(true);
  });
});
