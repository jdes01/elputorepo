import { Module } from '@nestjs/common';
import { ClubsModule } from '../../clubs/infrastructure/clubs.module';
import { BookingRepository } from '../domain/repositories/booking.repository';
import { BookingsController } from './controllers/bookings.controller';
import { BookCourt } from '../application/book-court.use-case';
import { CancelBooking } from '../application/cancel-booking.use-case';
import { GetAvailability } from '../application/get-availability.use-case';
import { ListMyBookings } from '../application/list-my-bookings.use-case';
import { DrizzleBookingRepository } from './persistence/drizzle-booking.repository';

@Module({
  imports: [ClubsModule],
  controllers: [BookingsController],
  providers: [
    BookCourt,
    CancelBooking,
    GetAvailability,
    ListMyBookings,
    { provide: BookingRepository, useClass: DrizzleBookingRepository },
  ],
})
export class BookingsModule {}
