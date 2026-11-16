import { Injectable } from '@nestjs/common';
import { CourtNotFound } from '../../clubs/domain/errors/club.errors';
import { ClubRepository } from '../../clubs/domain/repositories/club.repository';
import { CourtRepository } from '../../clubs/domain/repositories/court.repository';
import type { CourtId } from '../../clubs/domain/value-objects/court-id.value-object';
import { Mailer } from '../../shared/application/mailer';
import type { CalendarDate } from '../../shared/domain/value-objects/calendar-date.value-object';
import type { TimeOfDay } from '../../shared/domain/value-objects/time-of-day.value-object';
import { Booking } from '../domain/entities/booking.entity';
import { BookingRepository } from '../domain/repositories/booking.repository';
import type { UserId } from '../domain/value-objects/user-id.value-object';

@Injectable()
export class BookCourt {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly courts: CourtRepository,
    private readonly clubs: ClubRepository,
    private readonly mailer: Mailer,
  ) {}

  async execute(userId: UserId, courtId: CourtId, date: CalendarDate, start: TimeOfDay): Promise<Booking> {
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
}
