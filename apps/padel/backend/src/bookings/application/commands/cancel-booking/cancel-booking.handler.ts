import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '../../../../shared/application/event-bus';
import { BookingNotFound } from '../../../domain/errors/booking.errors';
import { BookingWasCancelledEvent } from '../../../domain/events/booking-was-cancelled.event';
import { CourtDayRepository } from '../../../domain/repositories/court-day.repository';
import { retryWhenCourtDayChanges } from '../retry-when-court-day-changes';
import type { CancelBookingCommand } from './cancel-booking.command';

@Injectable()
export class CancelBookingHandler {
  private readonly logger = new Logger(CancelBookingHandler.name);

  constructor(
    private readonly courtDays: CourtDayRepository,
    private readonly events: EventBus,
  ) {}

  async execute({ userId, bookingId }: CancelBookingCommand): Promise<void> {
    const now = new Date();

    const booking = await retryWhenCourtDayChanges(async () => {
      const day = await this.courtDays.loadContaining(bookingId);
      if (!day) throw new BookingNotFound();
      const cancelled = day.cancel(bookingId, userId, now);
      await this.courtDays.save(day);
      return cancelled;
    });
    this.logger.log({ bookingId: bookingId.toNumber() }, 'reserva cancelada');

    await this.events.publish(
      new BookingWasCancelledEvent(booking.id, booking.courtId, booking.userId, booking.date, booking.slot, now),
    );
  }
}
