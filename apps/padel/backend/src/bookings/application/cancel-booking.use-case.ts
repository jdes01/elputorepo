import { Injectable } from '@nestjs/common';
import { BookingNotFound } from '../domain/errors/booking.errors';
import { BookingRepository } from '../domain/repositories/booking.repository';
import type { BookingId } from '../domain/value-objects/booking-id.value-object';
import type { UserId } from '../domain/value-objects/user-id.value-object';

@Injectable()
export class CancelBooking {
  constructor(private readonly bookings: BookingRepository) {}

  async execute(userId: UserId, id: BookingId): Promise<void> {
    const booking = await this.bookings.findById(id);
    if (!booking) throw new BookingNotFound();

    booking.cancel(userId, new Date());

    await this.bookings.remove(booking);
    console.log('reserva cancelada', id.toNumber());
  }
}
