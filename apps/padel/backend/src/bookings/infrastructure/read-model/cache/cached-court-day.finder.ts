import { Inject, Injectable } from '@nestjs/common';
import type { CourtId } from '../../../../clubs/domain/value-objects/court-id.value-object';
import type { CalendarDate } from '../../../../shared/domain/value-objects/calendar-date.value-object';
import { CourtDayFinder, type CourtDayView } from '../../../application/queries/get-availability/court-day.finder';
import { MongoCourtDayFinder } from '../mongo-court-day.finder';
import { CourtDayCache } from './court-day.cache';

// Cache-aside: primero la cache; si no esta, la fuente (Mongo), y se guarda para
// la proxima. Es el mismo puerto que el finder de Mongo: el query handler no
// sabe que hay cache.
@Injectable()
export class CachedCourtDayFinder extends CourtDayFinder {
  constructor(
    @Inject(MongoCourtDayFinder) private readonly source: CourtDayFinder,
    private readonly cache: CourtDayCache,
  ) {
    super();
  }

  async find(courtId: CourtId, date: CalendarDate): Promise<CourtDayView | undefined> {
    const cached = await this.cache.get(courtId, date);
    if (cached) return cached;

    const view = await this.source.find(courtId, date);
    // Una pista que no existe no se guarda: si se crea luego, se veria tarde.
    if (view) await this.cache.set(courtId, date, view);
    return view;
  }
}
