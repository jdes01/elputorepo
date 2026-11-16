import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import type { Club, Court } from './club.model';

@Injectable()
export class ClubsService {
  constructor(private readonly db: Pool) {}

  async createClub(name: string): Promise<Club> {
    const r = await this.db.query<Club>('INSERT INTO clubs (name) VALUES ($1) RETURNING *', [name]);
    console.log('club creado', r.rows[0]);
    return r.rows[0]!;
  }

  async listClubs(): Promise<Club[]> {
    return (await this.db.query<Club>('SELECT * FROM clubs ORDER BY id')).rows;
  }

  async createCourt(clubId: number, name: string, opens: string, closes: string): Promise<Court> {
    const r = await this.db.query<Court>(
      'INSERT INTO courts (club_id, name, opens, closes) VALUES ($1, $2, $3, $4) RETURNING *',
      [clubId, name, opens, closes],
    );
    console.log('pista creada', r.rows[0]);
    return r.rows[0]!;
  }

  async listCourts(clubId: number): Promise<Court[]> {
    return (await this.db.query<Court>('SELECT * FROM courts WHERE club_id = $1 ORDER BY id', [clubId])).rows;
  }
}
