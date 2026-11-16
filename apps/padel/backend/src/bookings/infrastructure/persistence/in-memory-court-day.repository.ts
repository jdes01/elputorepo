import type { Court } from '../../../clubs/domain/entities/court.entity';
import type { InMemoryCourtRepository } from '../../../clubs/infrastructure/persistence/in-memory-court.repository';
import type { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import { CourtDay } from '../../domain/aggregates/court-day.aggregate';
import type { Booking } from '../../domain/entities/booking.entity';
import { CourtDayChangedMeanwhile } from '../../domain/errors/booking.errors';
import { CourtDayRepository } from '../../domain/repositories/court-day.repository';
import { BookingId } from '../../domain/value-objects/booking-id.value-object';

// La misma agenda con version, en memoria: para tests sin BD.
export class InMemoryCourtDayRepository extends CourtDayRepository {
  private readonly bookings = new Map<number, Booking>();
  private readonly versions = new Map<string, number>();
  private lastId = 0;

  constructor(private readonly courts: InMemoryCourtRepository) {
    super();
  }

  async nextBookingId(): Promise<BookingId> {
    return BookingId.of(++this.lastId);
  }

  async load(court: Court, date: CalendarDate): Promise<CourtDay> {
    const ofTheDay = this.allBookings().filter(
      (b) => b.courtId.equals(court.id) && b.date.equals(date) && !b.isCancelled(),
    );
    return CourtDay.open(court, date, ofTheDay, this.versions.get(keyOf(court, date)) ?? 0);
  }

  async loadContaining(bookingId: BookingId): Promise<CourtDay | undefined> {
    const booking = this.bookings.get(bookingId.toNumber());
    const court = booking && (await this.courts.findById(booking.courtId));
    return court && this.load(court, booking.date);
  }

  async save(day: CourtDay): Promise<void> {
    const key = keyOf(day.court, day.date);
    if ((this.versions.get(key) ?? 0) !== day.version) throw new CourtDayChangedMeanwhile();
    this.versions.set(key, day.version + 1);
    for (const b of day.newBookings()) this.bookings.set(b.id.toNumber(), b);
    // Las canceladas se quedan, marcadas.
    for (const b of day.cancelledBookings()) this.bookings.set(b.id.toNumber(), b);
  }

  // Fuera del puerto: lo leen los finders en memoria.
  allBookings(): Booking[] {
    return [...this.bookings.values()];
  }
}

const keyOf = (court: Court, date: CalendarDate) => `${court.id.toNumber()} ${date}`;
