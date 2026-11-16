import type { BookingId } from '../../../domain/value-objects/booking-id.value-object';
import type { UserId } from '../../../domain/value-objects/user-id.value-object';

export class CancelBookingCommand {
  constructor(
    readonly userId: UserId,
    readonly bookingId: BookingId,
  ) {}
}
