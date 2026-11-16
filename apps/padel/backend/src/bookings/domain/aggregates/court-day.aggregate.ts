import type { Court } from '../../../clubs/domain/entities/court.entity';
import { SlotOutsideOpeningHours } from '../../../clubs/domain/errors/club.errors';
import type { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import type { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';
import type { TimeSlot } from '../../../shared/domain/value-objects/time-slot.value-object';
import { Booking } from '../entities/booking.entity';
import { BookingNotFound, SlotAlreadyTaken } from '../errors/booking.errors';
import type { BookingId } from '../value-objects/booking-id.value-object';
import type { UserId } from '../value-objects/user-id.value-object';

// Una casilla de la rejilla: una franja, libre o con su reserva.
interface Cell {
  slot: TimeSlot;
  booking?: Booking;
}

// La agenda de una pista en un dia: la rejilla de franjas que sale de su
// horario, cada una libre u ocupada por una reserva.
//
//   09:00  libre
//   10:30  reserva #7 (ana)
//   12:00  libre
//   ...
//
// Es el aggregate: la unica forma de reservar o cancelar en esa pista ese dia.
// Se guarda entero o no se guarda: `version` dice que agenda se leyo, y guardar
// falla si alguien la cambio antes.
export class CourtDay {
  private readonly booked: Booking[] = [];
  private readonly cancelled: Booking[] = [];

  private constructor(
    readonly court: Court,
    readonly date: CalendarDate,
    private readonly cells: Cell[],
    readonly version: number,
  ) {}

  // Monta la rejilla del horario de la pista y coloca en ella sus reservas. Las
  // canceladas no ocupan franja.
  static open(court: Court, date: CalendarDate, bookings: Booking[], version: number): CourtDay {
    const active = bookings.filter((b) => !b.isCancelled());
    const cells = court.openingHours
      .slots()
      .map((slot) => ({ slot, booking: active.find((b) => b.slot.equals(slot)) }));
    return new CourtDay(court, date, cells, version);
  }

  book(props: { id: BookingId; userId: UserId; start: TimeOfDay; now: Date }): Booking {
    const cell = this.cells.find((c) => c.slot.start.equals(props.start));
    if (!cell) throw new SlotOutsideOpeningHours(props.start);
    if (cell.booking) throw new SlotAlreadyTaken();

    cell.booking = Booking.book({ ...props, courtId: this.court.id, date: this.date, slot: cell.slot });
    this.booked.push(cell.booking);
    return cell.booking;
  }

  cancel(bookingId: BookingId, by: UserId, now: Date): Booking {
    const cell = this.cells.find((c) => c.booking?.id.equals(bookingId));
    if (!cell?.booking) throw new BookingNotFound();

    const booking = cell.booking;
    booking.cancel(by, now);
    this.cancelled.push(booking);
    cell.booking = undefined;
    return booking;
  }

  // Lo que ha cambiado desde que se cargo: lo que hay que guardar.
  newBookings(): Booking[] {
    return [...this.booked];
  }

  cancelledBookings(): Booking[] {
    return [...this.cancelled];
  }
}
