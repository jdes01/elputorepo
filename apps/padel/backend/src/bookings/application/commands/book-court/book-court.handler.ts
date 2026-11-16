import { Injectable } from '@nestjs/common';
import { CourtNotFound } from '../../../../clubs/domain/errors/club.errors';
import { CourtRepository } from '../../../../clubs/domain/repositories/court.repository';
import { EventBus } from '../../../../shared/application/event-bus';
import type { Booking } from '../../../domain/entities/booking.entity';
import { CourtWasBookedEvent } from '../../../domain/events/court-was-booked.event';
import { CourtDayRepository } from '../../../domain/repositories/court-day.repository';
import { retryWhenCourtDayChanges } from '../retry-when-court-day-changes';
import type { BookCourtCommand } from './book-court.command';

@Injectable()
export class BookCourtHandler {
  constructor(
    private readonly courts: CourtRepository,
    private readonly courtDays: CourtDayRepository,
    private readonly events: EventBus,
  ) {}

  async execute({ userId, courtId, date, start }: BookCourtCommand): Promise<Booking> {
    const court = await this.courts.findById(courtId);
    if (!court) throw new CourtNotFound();
    const now = new Date();

    const booking = await retryWhenCourtDayChanges(async () => {
      const day = await this.courtDays.load(court, date);
      const booked = day.book({ id: await this.courtDays.nextBookingId(), userId, start, now });
      await this.courtDays.save(day);
      return booked;
    });
    console.log('reserva creada', booking.id.toNumber());

    await this.events.publish(new CourtWasBookedEvent(booking.id, court.id, userId, date, booking.slot, now));
    return booking;
  }
}
