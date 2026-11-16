import { Inject, Injectable } from '@nestjs/common';
import type { Db } from 'mongodb';
import type { CourtId } from '../../../clubs/domain/value-objects/court-id.value-object';
import type { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import { MONGO } from '../../../shared/infrastructure/mongo.module';
import { CourtDayFinder, type CourtDayView } from '../../application/queries/get-availability/court-day.finder';
import { courtDayId, readModel } from './read-model';

@Injectable()
export class MongoCourtDayFinder extends CourtDayFinder {
  private readonly model;

  constructor(@Inject(MONGO) db: Db) {
    super();
    this.model = readModel(db);
  }

  async find(courtId: CourtId, date: CalendarDate): Promise<CourtDayView | undefined> {
    const court = await this.model.courts.findOne({ _id: courtId.toNumber() });
    if (!court) return undefined;
    const day = await this.model.courtDays.findOne({ _id: courtDayId(courtId.toNumber(), date.toString()) });
    return { opens: court.opens, closes: court.closes, bookedStarts: day?.bookedStarts ?? [] };
  }
}
