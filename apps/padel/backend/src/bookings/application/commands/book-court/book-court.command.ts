import type { CourtId } from '../../../../clubs/domain/value-objects/court-id.value-object';
import type { CalendarDate } from '../../../../shared/domain/value-objects/calendar-date.value-object';
import type { TimeOfDay } from '../../../../shared/domain/value-objects/time-of-day.value-object';
import type { UserId } from '../../../domain/value-objects/user-id.value-object';

export class BookCourtCommand {
  constructor(
    readonly userId: UserId,
    readonly courtId: CourtId,
    readonly date: CalendarDate,
    readonly start: TimeOfDay,
  ) {}
}
