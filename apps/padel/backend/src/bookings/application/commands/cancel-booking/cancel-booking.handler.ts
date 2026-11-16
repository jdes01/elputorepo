import { Injectable } from '@nestjs/common';
import { BookingNotFound } from '../../../domain/errors/booking.errors';
import { BookingRepository } from '../../../domain/repositories/booking.repository';
import type { CancelBookingCommand } from './cancel-booking.command';

@Injectable()
export class CancelBookingHandler {
  constructor(private readonly bookings: BookingRepository) {}

  async execute({ userId, bookingId }: CancelBookingCommand): Promise<void> {
    const booking = await this.bookings.findById(bookingId);
    if (!booking) throw new BookingNotFound();

    booking.cancel(userId, new Date());

    await this.bookings.remove(booking);
    console.log('reserva cancelada', bookingId.toNumber());
  }
}
