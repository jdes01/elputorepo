import { Injectable } from '@nestjs/common';
import { CourtNotFound } from '../../../../clubs/domain/errors/club.errors';
import { CourtRepository } from '../../../../clubs/domain/repositories/court.repository';
import { EventBus } from '../../../../shared/application/event-bus';
import { Booking } from '../../../domain/entities/booking.entity';
import { CourtWasBookedEvent } from '../../../domain/events/court-was-booked.event';
import { BookingRepository } from '../../../domain/repositories/booking.repository';
import type { BookCourtCommand } from './book-court.command';

@Injectable()
export class BookCourtHandler {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly courts: CourtRepository,
    private readonly events: EventBus,
  ) {}

  async execute({ userId, courtId, date, start }: BookCourtCommand): Promise<Booking> {
    const court = await this.courts.findById(courtId);
    if (!court) throw new CourtNotFound();

    const now = new Date();
    const booking = Booking.book({
      id: await this.bookings.nextId(),
      court,
      userId,
      date,
      start,
      taken: await this.bookings.findByCourtAndDate(courtId, date),
      now,
    });

    await this.bookings.save(booking);
    console.log('reserva creada', booking.id.toNumber());

    await this.events.publish(new CourtWasBookedEvent(booking.id, court.id, userId, date, booking.slot, now));
    return booking;
  }
}
