import type { CourtId } from '../../../../clubs/domain/value-objects/court-id.value-object';
import type { CalendarDate } from '../../../../shared/domain/value-objects/calendar-date.value-object';
import type { CourtDayView } from '../../../application/queries/get-availability/court-day.finder';
import { CourtDayCache, courtDayKey } from './court-day.cache';

// La misma cache, en memoria: para tests sin Redis.
export class InMemoryCourtDayCache extends CourtDayCache {
  readonly entries = new Map<string, CourtDayView>();

  async get(courtId: CourtId, date: CalendarDate): Promise<CourtDayView | undefined> {
    return this.entries.get(courtDayKey(courtId, date));
  }

  async set(courtId: CourtId, date: CalendarDate, view: CourtDayView): Promise<void> {
    this.entries.set(courtDayKey(courtId, date), view);
  }

  async evict(courtId: CourtId, date: CalendarDate): Promise<void> {
    this.entries.delete(courtDayKey(courtId, date));
  }

  async clear(): Promise<void> {
    this.entries.clear();
  }
}
