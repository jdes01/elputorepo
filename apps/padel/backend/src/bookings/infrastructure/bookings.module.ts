import { Module } from '@nestjs/common';
import { ClubsModule } from '../../clubs/infrastructure/clubs.module';
import { BookCourtHandler } from '../application/commands/book-court/book-court.handler';
import { CancelBookingHandler } from '../application/commands/cancel-booking/cancel-booking.handler';
import { CourtDayFinder } from '../application/queries/get-availability/court-day.finder';
import { GetAvailabilityHandler } from '../application/queries/get-availability/get-availability.handler';
import { ListMyBookingsHandler } from '../application/queries/list-my-bookings/list-my-bookings.handler';
import { MyBookingsFinder } from '../application/queries/list-my-bookings/my-bookings.finder';
import { BookingRepository } from '../domain/repositories/booking.repository';
import { BookCourtController } from './controllers/book-court.controller';
import { CancelBookingController } from './controllers/cancel-booking.controller';
import { GetAvailabilityController } from './controllers/get-availability.controller';
import { ListMyBookingsController } from './controllers/list-my-bookings.controller';
import { DrizzleBookingRepository } from './persistence/drizzle-booking.repository';
import { DrizzleCourtDayFinder } from './persistence/drizzle-court-day.finder';
import { DrizzleMyBookingsFinder } from './persistence/drizzle-my-bookings.finder';

@Module({
  imports: [ClubsModule],
  controllers: [BookCourtController, CancelBookingController, GetAvailabilityController, ListMyBookingsController],
  providers: [
    // Escritura: command handlers sobre repositorios.
    BookCourtHandler,
    CancelBookingHandler,
    { provide: BookingRepository, useClass: DrizzleBookingRepository },
    // Lectura: query handlers sobre finders.
    GetAvailabilityHandler,
    ListMyBookingsHandler,
    { provide: CourtDayFinder, useClass: DrizzleCourtDayFinder },
    { provide: MyBookingsFinder, useClass: DrizzleMyBookingsFinder },
  ],
})
export class BookingsModule {}
