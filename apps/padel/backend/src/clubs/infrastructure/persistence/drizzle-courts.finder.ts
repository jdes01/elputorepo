import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { courts } from '../../../schema';
import { DATABASE, type Database } from '../../../shared/infrastructure/database.module';
import { CourtsFinder, type CourtView } from '../../application/queries/list-courts/courts.finder';
import type { ClubId } from '../../domain/value-objects/club-id.value-object';

@Injectable()
export class DrizzleCourtsFinder extends CourtsFinder {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  ofClub(clubId: ClubId): Promise<CourtView[]> {
    return this.db
      .select({ id: courts.id, clubId: courts.clubId, name: courts.name, opens: courts.opens, closes: courts.closes })
      .from(courts)
      .where(eq(courts.clubId, clubId.toNumber()))
      .orderBy(asc(courts.id));
  }
}
