import type { CourtId } from '../../../../clubs/domain/value-objects/court-id.value-object';
import type { CalendarDate } from '../../../../shared/domain/value-objects/calendar-date.value-object';

export class GetAvailabilityQuery {
  constructor(
    readonly courtId: CourtId,
    readonly date: CalendarDate,
  ) {}
}
