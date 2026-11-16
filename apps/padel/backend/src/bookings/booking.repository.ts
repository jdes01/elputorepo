import type { CourtId } from '../clubs/value-objects/court-id.value-object';
import type { CalendarDate } from '../shared/value-objects/calendar-date.value-object';
import type { Booking } from './booking.entity';
import type { BookingId } from './value-objects/booking-id.value-object';
import type { UserId } from './value-objects/user-id.value-object';

export abstract class BookingRepository {
  abstract nextId(): Promise<BookingId>;
  abstract save(booking: Booking): Promise<void>;
  abstract remove(booking: Booking): Promise<void>;
  abstract findById(id: BookingId): Promise<Booking | undefined>;
  abstract findByCourtAndDate(courtId: CourtId, date: CalendarDate): Promise<Booking[]>;
  // Por fecha y hora de inicio.
  abstract findByUser(userId: UserId): Promise<Booking[]>;
}
