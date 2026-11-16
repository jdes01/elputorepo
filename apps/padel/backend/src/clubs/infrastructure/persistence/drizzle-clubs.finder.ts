import { Inject, Injectable } from '@nestjs/common';
import { asc } from 'drizzle-orm';
import { clubs } from '../../../schema';
import { DATABASE, type Database } from '../../../shared/infrastructure/database.module';
import { ClubsFinder, type ClubView } from '../../application/queries/list-clubs/clubs.finder';

@Injectable()
export class DrizzleClubsFinder extends ClubsFinder {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  all(): Promise<ClubView[]> {
    return this.db.select({ id: clubs.id, name: clubs.name }).from(clubs).orderBy(asc(clubs.id));
  }
}
