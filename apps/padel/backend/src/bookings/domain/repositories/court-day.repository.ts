import type { Court } from '../../../clubs/domain/entities/court.entity';
import type { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import type { CourtDay } from '../aggregates/court-day.aggregate';
import type { BookingId } from '../value-objects/booking-id.value-object';

// El unico repositorio de reservas: se crean, se cancelan y se guardan a traves
// de la agenda del dia.
export abstract class CourtDayRepository {
  abstract nextBookingId(): Promise<BookingId>;
  abstract load(court: Court, date: CalendarDate): Promise<CourtDay>;
  // La agenda en la que esta una reserva, o undefined si la reserva no existe.
  abstract loadContaining(bookingId: BookingId): Promise<CourtDay | undefined>;
  // Lanza CourtDayChangedMeanwhile si la agenda ya no esta en la version que se leyo.
  abstract save(day: CourtDay): Promise<void>;
}
