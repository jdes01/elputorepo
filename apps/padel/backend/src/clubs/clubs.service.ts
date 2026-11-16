import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { type Club, clubFromRow, type ClubRow, type Court, courtFromRow, type CourtRow } from './club.model';
import type { ClubId } from './value-objects/club-id.value-object';
import type { ClubName } from './value-objects/club-name.value-object';
import type { CourtName } from './value-objects/court-name.value-object';
import type { OpeningHours } from './value-objects/opening-hours.value-object';

@Injectable()
export class ClubsService {
  constructor(private readonly db: Pool) {}

  async createClub(name: ClubName): Promise<Club> {
    const r = await this.db.query<ClubRow>('INSERT INTO clubs (name) VALUES ($1) RETURNING *', [name.toString()]);
    console.log('club creado', r.rows[0]);
    return clubFromRow(r.rows[0]!);
  }

  async listClubs(): Promise<Club[]> {
    return (await this.db.query<ClubRow>('SELECT * FROM clubs ORDER BY id')).rows.map(clubFromRow);
  }

  async createCourt(clubId: ClubId, name: CourtName, openingHours: OpeningHours): Promise<Court> {
    const r = await this.db.query<CourtRow>(
      'INSERT INTO courts (club_id, name, opens, closes) VALUES ($1, $2, $3, $4) RETURNING *',
      [clubId.toNumber(), name.toString(), openingHours.opens.toString(), openingHours.closes.toString()],
    );
    console.log('pista creada', r.rows[0]);
    return courtFromRow(r.rows[0]!);
  }

  async listCourts(clubId: ClubId): Promise<Court[]> {
    const r = await this.db.query<CourtRow>('SELECT * FROM courts WHERE club_id = $1 ORDER BY id', [clubId.toNumber()]);
    return r.rows.map(courtFromRow);
  }
}
