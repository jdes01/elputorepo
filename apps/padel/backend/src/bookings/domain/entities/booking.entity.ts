import type { CourtId } from '../../../clubs/domain/value-objects/court-id.value-object';
import { CLUBS_TIME_ZONE } from '../../../shared/domain/time-zone';
import type { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import type { TimeSlot } from '../../../shared/domain/value-objects/time-slot.value-object';
import {
  BookingAlreadyCancelled,
  BookingInThePast,
  CancellationTooLate,
  NotBookingOwner,
} from '../errors/booking.errors';
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
    private cancelledAt?: Date,
  ) {}

  // Que la franja exista y este libre lo decide la agenda del dia (CourtDay), que
  // es quien la crea. La reserva solo sabe que no puede ser en el pasado.
  static book(props: {
    id: BookingId;
    courtId: CourtId;
    userId: UserId;
    date: CalendarDate;
    slot: TimeSlot;
    now: Date;
  }): Booking {
    const { id, courtId, userId, date, slot, now } = props;
    const booking = new Booking(id, courtId, userId, date, slot);
    if (booking.startsAt() < now) throw new BookingInThePast();
    return booking;
  }

  static restore(
    id: BookingId,
    courtId: CourtId,
    userId: UserId,
    date: CalendarDate,
    slot: TimeSlot,
    cancelledAt?: Date,
  ): Booking {
    return new Booking(id, courtId, userId, date, slot, cancelledAt);
  }

  // Cancelar no la borra: la marca. La reserva sigue existiendo, ya sin ocupar su franja.
  cancel(by: UserId, now: Date): void {
    if (this.cancelledAt) throw new BookingAlreadyCancelled();
    if (!this.userId.equals(by)) throw new NotBookingOwner();
    if (this.startsAt().getTime() - now.getTime() < CANCELLATION_NOTICE_MS) throw new CancellationTooLate();
    this.cancelledAt = now;
  }

  isCancelled(): boolean {
    return this.cancelledAt !== undefined;
  }

  cancelledOn(): Date | undefined {
    return this.cancelledAt;
  }

  startsAt(): Date {
    return this.date.at(this.slot.start, CLUBS_TIME_ZONE);
  }

  equals(other: Booking): boolean {
    return this.id.equals(other.id);
  }
}
