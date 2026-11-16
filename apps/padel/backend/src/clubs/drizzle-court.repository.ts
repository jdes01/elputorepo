import { Inject, Injectable } from '@nestjs/common';
import { asc, eq, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../database.module';
import { courts } from '../schema';
import { TimeOfDay } from '../shared/value-objects/time-of-day.value-object';
import { Court } from './court.entity';
import { CourtRepository } from './court.repository';
import { ClubId } from './value-objects/club-id.value-object';
import { CourtId } from './value-objects/court-id.value-object';
import { CourtName } from './value-objects/court-name.value-object';
import { OpeningHours } from './value-objects/opening-hours.value-object';

@Injectable()
export class DrizzleCourtRepository extends CourtRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async nextId(): Promise<CourtId> {
    const { rows } = await this.db.execute<{ id: string }>(
      sql`SELECT nextval(pg_get_serial_sequence('courts', 'id')) AS id`,
    );
    return CourtId.of(Number(rows[0]!.id));
  }

  async save(court: Court): Promise<void> {
    await this.db.insert(courts).values({
      id: court.id.toNumber(),
      clubId: court.clubId.toNumber(),
      name: court.name.toString(),
      opens: court.openingHours.opens.toString(),
      closes: court.openingHours.closes.toString(),
    });
  }

  async findById(id: CourtId): Promise<Court | undefined> {
    const [row] = await this.db.select().from(courts).where(eq(courts.id, id.toNumber()));
    return row && toCourt(row);
  }

  async findByClub(clubId: ClubId): Promise<Court[]> {
    const rows = await this.db
      .select()
      .from(courts)
      .where(eq(courts.clubId, clubId.toNumber()))
      .orderBy(asc(courts.id));
    return rows.map(toCourt);
  }
}

function toCourt(row: typeof courts.$inferSelect): Court {
  return Court.restore(
    CourtId.of(row.id),
    ClubId.of(row.clubId),
    CourtName.of(row.name),
    OpeningHours.of(TimeOfDay.parse(row.opens), TimeOfDay.parse(row.closes)),
  );
}
