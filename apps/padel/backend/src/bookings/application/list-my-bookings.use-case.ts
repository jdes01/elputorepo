import { Injectable } from '@nestjs/common';
import { ClubRepository } from '../../clubs/domain/repositories/club.repository';
import { CourtRepository } from '../../clubs/domain/repositories/court.repository';
import type { Booking } from '../domain/entities/booking.entity';
import { BookingRepository } from '../domain/repositories/booking.repository';
import type { UserId } from '../domain/value-objects/user-id.value-object';

@Injectable()
export class ListMyBookings {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly courts: CourtRepository,
    private readonly clubs: ClubRepository,
  ) {}

  async execute(userId: UserId): Promise<Booking[]> {
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
