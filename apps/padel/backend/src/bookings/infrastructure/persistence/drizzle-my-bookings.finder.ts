import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { bookings, clubs, courts } from '../../../schema';
import { DATABASE, type Database } from '../../../shared/infrastructure/database.module';
import { MyBookingsFinder, type MyBookingView } from '../../application/queries/list-my-bookings/my-bookings.finder';
import type { UserId } from '../../domain/value-objects/user-id.value-object';

@Injectable()
export class DrizzleMyBookingsFinder extends MyBookingsFinder {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  // Una sola consulta, con los nombres de pista y club ya unidos.
  ofUser(userId: UserId): Promise<MyBookingView[]> {
    return this.db
      .select({
        id: bookings.id,
        courtId: bookings.courtId,
        userId: bookings.userId,
        date: bookings.date,
        start: bookings.start,
        end: bookings.end,
        courtName: courts.name,
        clubName: clubs.name,
      })
      .from(bookings)
      .innerJoin(courts, eq(courts.id, bookings.courtId))
      .innerJoin(clubs, eq(clubs.id, courts.clubId))
      .where(and(eq(bookings.userId, userId.toString()), isNull(bookings.cancelledAt)))
      .orderBy(asc(bookings.date), asc(bookings.start));
  }
}
