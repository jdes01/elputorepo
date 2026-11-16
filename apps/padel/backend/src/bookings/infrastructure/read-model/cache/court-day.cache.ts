import type { CourtId } from '../../../../clubs/domain/value-objects/court-id.value-object';
import type { CalendarDate } from '../../../../shared/domain/value-objects/calendar-date.value-object';
import type { CourtDayView } from '../../../application/queries/get-availability/court-day.finder';

// La cache de la agenda de una pista un dia. Una cache caida es una cache vacia:
// get devuelve undefined y set y evict no hacen nada, pero ninguna lanza.
export abstract class CourtDayCache {
  abstract get(courtId: CourtId, date: CalendarDate): Promise<CourtDayView | undefined>;
  abstract set(courtId: CourtId, date: CalendarDate, view: CourtDayView): Promise<void>;
  abstract evict(courtId: CourtId, date: CalendarDate): Promise<void>;
  abstract clear(): Promise<void>;
}

export const courtDayKey = (courtId: CourtId, date: CalendarDate) => `court-day:${courtId.toNumber()}:${date}`;
