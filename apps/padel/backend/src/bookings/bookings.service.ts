import { Injectable } from '@nestjs/common';
import { CourtNotFound } from '../clubs/club.errors';
import { ClubRepository } from '../clubs/club.repository';
import type { SlotAvailability } from '../clubs/court.entity';
import { CourtRepository } from '../clubs/court.repository';
import type { CourtId } from '../clubs/value-objects/court-id.value-object';
import { Mailer } from '../mail.module';
import type { CalendarDate } from '../shared/value-objects/calendar-date.value-object';
import type { TimeOfDay } from '../shared/value-objects/time-of-day.value-object';
import { Booking } from './booking.entity';
import { BookingNotFound } from './booking.errors';
import { BookingRepository } from './booking.repository';
import type { BookingId } from './value-objects/booking-id.value-object';
import type { UserId } from './value-objects/user-id.value-object';

@Injectable()
export class BookingsService {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly courts: CourtRepository,
    private readonly clubs: ClubRepository,
    private readonly mailer: Mailer,
  ) {}

  async book(userId: UserId, courtId: CourtId, date: CalendarDate, start: TimeOfDay): Promise<Booking> {
    const court = await this.courts.findById(courtId);
    if (!court) throw new CourtNotFound();

    const booking = Booking.book({
      id: await this.bookings.nextId(),
      court,
      userId,
      date,
      start,
      taken: await this.bookings.findByCourtAndDate(courtId, date),
      now: new Date(),
    });

    await this.bookings.save(booking);
    console.log('reserva creada', booking.id.toNumber());

    // correo de confirmacion
    const club = (await this.clubs.findById(court.clubId))!;
    await this.mailer.send(
      userId.toString(),
      'Reserva confirmada',
      `<h1>Reserva confirmada</h1><p>${club.name} - ${court.name}</p><p>${date} de ${booking.slot.start} a ${booking.slot.end}</p>`,
    );

    return booking;
  }

  async cancel(userId: UserId, id: BookingId): Promise<void> {
    const booking = await this.bookings.findById(id);
    if (!booking) throw new BookingNotFound();

    booking.cancel(userId, new Date());

    await this.bookings.remove(booking);
    console.log('reserva cancelada', id.toNumber());
  }

  async availability(courtId: CourtId, date: CalendarDate): Promise<SlotAvailability[]> {
    const court = await this.courts.findById(courtId);
    if (!court) throw new CourtNotFound();
    const bookings = await this.bookings.findByCourtAndDate(courtId, date);

    return court.availability(bookings.map((b) => b.slot));
  }

  async myBookings(userId: UserId): Promise<Booking[]> {
    const bookings = await this.bookings.findByUser(userId);
    // Una consulta por reserva para su pista y otra para su club.
    /* oxlint-disable no-await-in-loop */
    for (const b of bookings) {
      const court = (await this.courts.findById(b.courtId))!;
      const club = (await this.clubs.findById(court.clubId))!;
      b.courtName = court.name;
      b.clubName = club.name;
    }
    /* oxlint-enable no-await-in-loop */
    return bookings;
  }
}
