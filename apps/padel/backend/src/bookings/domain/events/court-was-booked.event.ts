import type { CourtId } from '../../../clubs/domain/value-objects/court-id.value-object';
import { DomainEvent } from '../../../shared/domain/events/domain-event';
import type { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import type { TimeSlot } from '../../../shared/domain/value-objects/time-slot.value-object';
import type { BookingId } from '../value-objects/booking-id.value-object';
import type { UserId } from '../value-objects/user-id.value-object';

export class CourtWasBookedEvent extends DomainEvent {
  constructor(
    readonly bookingId: BookingId,
    readonly courtId: CourtId,
    readonly userId: UserId,
    readonly date: CalendarDate,
    readonly slot: TimeSlot,
    occurredAt: Date,
  ) {
    super(occurredAt);
  }
}
