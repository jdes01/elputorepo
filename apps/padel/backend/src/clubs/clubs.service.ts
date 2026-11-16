import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { TimeOfDay } from '../shared/value-objects/time-of-day.value-object';
import { Club } from './club.entity';
import { ClubNotFound } from './club.errors';
import { Court } from './court.entity';
import { ClubId } from './value-objects/club-id.value-object';
import { ClubName } from './value-objects/club-name.value-object';
import { CourtId } from './value-objects/court-id.value-object';
import { CourtName } from './value-objects/court-name.value-object';
import { OpeningHours } from './value-objects/opening-hours.value-object';

export interface ClubRow {
  id: number;
  name: string;
}

export interface CourtRow {
  id: number;
  club_id: number;
  name: string;
  opens: string;
  closes: string;
}

export function clubFromRow(row: ClubRow): Club {
  return Club.restore(ClubId.of(row.id), ClubName.of(row.name));
}

export function courtFromRow(row: CourtRow): Court {
  return Court.restore(
    CourtId.of(row.id),
    ClubId.of(row.club_id),
    CourtName.of(row.name),
    OpeningHours.of(TimeOfDay.parse(row.opens), TimeOfDay.parse(row.closes)),
  );
}

@Injectable()
export class ClubsService {
  constructor(private readonly db: Pool) {}

  async createClub(name: ClubName): Promise<Club> {
    const club = Club.register(ClubId.of(await this.nextId('clubs')), name);
    await this.db.query('INSERT INTO clubs (id, name) VALUES ($1, $2)', [club.id.toNumber(), club.name.toString()]);
    console.log('club creado', club.id.toNumber());
    return club;
  }

  async listClubs(): Promise<Club[]> {
    return (await this.db.query<ClubRow>('SELECT * FROM clubs ORDER BY id')).rows.map(clubFromRow);
  }

  async createCourt(clubId: ClubId, name: CourtName, openingHours: OpeningHours): Promise<Court> {
    const row = (await this.db.query<ClubRow>('SELECT * FROM clubs WHERE id = $1', [clubId.toNumber()])).rows[0];
    if (!row) throw new ClubNotFound();

    const court = Court.open(CourtId.of(await this.nextId('courts')), clubFromRow(row), name, openingHours);
    await this.db.query('INSERT INTO courts (id, club_id, name, opens, closes) VALUES ($1, $2, $3, $4, $5)', [
      court.id.toNumber(),
      court.clubId.toNumber(),
      court.name.toString(),
      court.openingHours.opens.toString(),
      court.openingHours.closes.toString(),
    ]);
    console.log('pista creada', court.id.toNumber());
    return court;
  }

  async listCourts(clubId: ClubId): Promise<Court[]> {
    const r = await this.db.query<CourtRow>('SELECT * FROM courts WHERE club_id = $1 ORDER BY id', [clubId.toNumber()]);
    return r.rows.map(courtFromRow);
  }

  // El id sale de la secuencia de la tabla ANTES de crear la entidad: una entidad
  // nace con su identidad, no la recibe al guardarse.
  private async nextId(table: 'clubs' | 'courts'): Promise<number> {
    const r = await this.db.query<{ id: string }>(`SELECT nextval(pg_get_serial_sequence('${table}', 'id')) AS id`);
    return Number(r.rows[0]!.id);
  }
}
