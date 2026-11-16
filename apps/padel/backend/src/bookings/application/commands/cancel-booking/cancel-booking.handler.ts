import { Injectable } from '@nestjs/common';
import { BookingNotFound } from '../../../domain/errors/booking.errors';
import { CourtDayRepository } from '../../../domain/repositories/court-day.repository';
import { retryWhenCourtDayChanges } from '../retry-when-court-day-changes';
import type { CancelBookingCommand } from './cancel-booking.command';

@Injectable()
export class CancelBookingHandler {
  constructor(private readonly courtDays: CourtDayRepository) {}

  async execute({ userId, bookingId }: CancelBookingCommand): Promise<void> {
    const now = new Date();

    await retryWhenCourtDayChanges(async () => {
      const day = await this.courtDays.loadContaining(bookingId);
      if (!day) throw new BookingNotFound();
      day.cancel(bookingId, userId, now);
      await this.courtDays.save(day);
    });
    console.log('reserva cancelada', bookingId.toNumber());
  }
}
