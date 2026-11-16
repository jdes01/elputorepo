import { Inject, Injectable } from '@nestjs/common';
import { asc, eq, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../database.module';
import { clubs } from '../schema';
import { Club } from './club.entity';
import { ClubRepository } from './club.repository';
import { ClubId } from './value-objects/club-id.value-object';
import { ClubName } from './value-objects/club-name.value-object';

// El adaptador: el puerto ClubRepository sobre Postgres, con drizzle. Es el
// unico que sabe que un club es una fila de la tabla clubs.
@Injectable()
export class DrizzleClubRepository extends ClubRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async nextId(): Promise<ClubId> {
    const { rows } = await this.db.execute<{ id: string }>(
      sql`SELECT nextval(pg_get_serial_sequence('clubs', 'id')) AS id`,
    );
    return ClubId.of(Number(rows[0]!.id));
  }

  async save(club: Club): Promise<void> {
    await this.db.insert(clubs).values({ id: club.id.toNumber(), name: club.name.toString() });
  }

  async findById(id: ClubId): Promise<Club | undefined> {
    const [row] = await this.db.select().from(clubs).where(eq(clubs.id, id.toNumber()));
    return row && toClub(row);
  }

  async findAll(): Promise<Club[]> {
    return (await this.db.select().from(clubs).orderBy(asc(clubs.id))).map(toClub);
  }
}

function toClub(row: typeof clubs.$inferSelect): Club {
  return Club.restore(ClubId.of(row.id), ClubName.of(row.name));
}
