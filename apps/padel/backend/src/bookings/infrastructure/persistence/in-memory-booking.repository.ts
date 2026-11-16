import type { CourtId } from '../../../clubs/domain/value-objects/court-id.value-object';
import type { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import type { Booking } from '../../domain/entities/booking.entity';
import { BookingRepository } from '../../domain/repositories/booking.repository';
import { BookingId } from '../../domain/value-objects/booking-id.value-object';

export class InMemoryBookingRepository extends BookingRepository {
  private readonly bookings = new Map<number, Booking>();
  private lastId = 0;

  async nextId(): Promise<BookingId> {
    return BookingId.of(++this.lastId);
  }

  async save(booking: Booking): Promise<void> {
    this.bookings.set(booking.id.toNumber(), booking);
  }

  async remove(booking: Booking): Promise<void> {
    this.bookings.delete(booking.id.toNumber());
  }

  async findById(id: BookingId): Promise<Booking | undefined> {
    return this.bookings.get(id.toNumber());
  }

  // Fuera del puerto: lo leen los finders en memoria.
  all(): Booking[] {
    return [...this.bookings.values()];
  }

  async findByCourtAndDate(courtId: CourtId, date: CalendarDate): Promise<Booking[]> {
    return [...this.bookings.values()].filter((b) => b.courtId.equals(courtId) && b.date.equals(date));
  }
}
