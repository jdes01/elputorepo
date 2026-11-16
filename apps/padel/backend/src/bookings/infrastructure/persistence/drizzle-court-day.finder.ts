import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import type { CourtId } from '../../../clubs/domain/value-objects/court-id.value-object';
import { bookings, courts } from '../../../schema';
import type { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import { DATABASE, type Database } from '../../../shared/infrastructure/database.module';
import { CourtDayFinder, type CourtDayView } from '../../application/queries/get-availability/court-day.finder';

@Injectable()
export class DrizzleCourtDayFinder extends CourtDayFinder {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async find(courtId: CourtId, date: CalendarDate): Promise<CourtDayView | undefined> {
    const [court] = await this.db
      .select({ opens: courts.opens, closes: courts.closes })
      .from(courts)
      .where(eq(courts.id, courtId.toNumber()));
    if (!court) return undefined;

    const booked = await this.db
      .select({ start: bookings.start })
      .from(bookings)
      .where(
        and(eq(bookings.courtId, courtId.toNumber()), eq(bookings.date, date.toString()), isNull(bookings.cancelledAt)),
      );
    return { ...court, bookedStarts: booked.map((b) => b.start) };
  }
}
