import { Injectable } from '@nestjs/common';
import type { SlotAvailability } from '../../clubs/domain/entities/court.entity';
import { CourtNotFound } from '../../clubs/domain/errors/club.errors';
import { CourtRepository } from '../../clubs/domain/repositories/court.repository';
import type { CourtId } from '../../clubs/domain/value-objects/court-id.value-object';
import type { CalendarDate } from '../../shared/domain/value-objects/calendar-date.value-object';
import { BookingRepository } from '../domain/repositories/booking.repository';

@Injectable()
export class GetAvailability {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly courts: CourtRepository,
  ) {}

  async execute(courtId: CourtId, date: CalendarDate): Promise<SlotAvailability[]> {
    const court = await this.courts.findById(courtId);
    if (!court) throw new CourtNotFound();
    const bookings = await this.bookings.findByCourtAndDate(courtId, date);

    return court.availability(bookings.map((b) => b.slot));
  }
}
