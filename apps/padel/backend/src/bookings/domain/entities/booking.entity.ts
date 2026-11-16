import type { Court } from '../../../clubs/domain/entities/court.entity';
import type { CourtId } from '../../../clubs/domain/value-objects/court-id.value-object';
import { CLUBS_TIME_ZONE } from '../../../shared/domain/time-zone';
import type { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import type { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';
import type { TimeSlot } from '../../../shared/domain/value-objects/time-slot.value-object';
import { BookingInThePast, CancellationTooLate, NotBookingOwner, SlotAlreadyTaken } from '../errors/booking.errors';
import type { BookingId } from '../value-objects/booking-id.value-object';
import type { UserId } from '../value-objects/user-id.value-object';

const CANCELLATION_NOTICE_MS = 24 * 60 * 60 * 1000;

export class Booking {
  private constructor(
    readonly id: BookingId,
    readonly courtId: CourtId,
    readonly userId: UserId,
    readonly date: CalendarDate,
    readonly slot: TimeSlot,
  ) {}

  // `taken`: las reservas que ya tiene la pista. Solo cuentan las de ese dia.
  static book(props: {
    id: BookingId;
    court: Court;
    userId: UserId;
    date: CalendarDate;
    start: TimeOfDay;
    taken: Booking[];
    now: Date;
  }): Booking {
    const { id, court, userId, date, start, taken, now } = props;
    const booking = new Booking(id, court.id, userId, date, court.slotAt(start));

    if (booking.startsAt() < now) throw new BookingInThePast();
    if (taken.some((other) => booking.collidesWith(other))) throw new SlotAlreadyTaken();

    return booking;
  }

  static restore(id: BookingId, courtId: CourtId, userId: UserId, date: CalendarDate, slot: TimeSlot): Booking {
    return new Booking(id, courtId, userId, date, slot);
  }

  cancel(by: UserId, now: Date): void {
    if (!this.userId.equals(by)) throw new NotBookingOwner();
    if (this.startsAt().getTime() - now.getTime() < CANCELLATION_NOTICE_MS) throw new CancellationTooLate();
  }

  startsAt(): Date {
    return this.date.at(this.slot.start, CLUBS_TIME_ZONE);
  }

  equals(other: Booking): boolean {
    return this.id.equals(other.id);
  }

  private collidesWith(other: Booking): boolean {
    return this.courtId.equals(other.courtId) && this.date.equals(other.date) && this.slot.overlaps(other.slot);
  }
}
