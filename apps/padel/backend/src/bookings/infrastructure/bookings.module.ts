import { Module, type OnModuleInit } from '@nestjs/common';
import { ClubsModule } from '../../clubs/infrastructure/clubs.module';
import { InProcessEventBus } from '../../shared/infrastructure/in-process-event-bus';
import { BookCourtHandler } from '../application/commands/book-court/book-court.handler';
import { CancelBookingHandler } from '../application/commands/cancel-booking/cancel-booking.handler';
import { SendBookingConfirmationHandler } from '../application/events/send-booking-confirmation/send-booking-confirmation.handler';
import { CourtDayFinder } from '../application/queries/get-availability/court-day.finder';
import { GetAvailabilityHandler } from '../application/queries/get-availability/get-availability.handler';
import { ListMyBookingsHandler } from '../application/queries/list-my-bookings/list-my-bookings.handler';
import { MyBookingsFinder } from '../application/queries/list-my-bookings/my-bookings.finder';
import { CourtWasBookedEvent } from '../domain/events/court-was-booked.event';
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
    // Reacciones a eventos.
    SendBookingConfirmationHandler,
  ],
})
export class BookingsModule implements OnModuleInit {
  constructor(
    private readonly bus: InProcessEventBus,
    private readonly sendBookingConfirmation: SendBookingConfirmationHandler,
  ) {}

  onModuleInit(): void {
    this.bus.subscribe(CourtWasBookedEvent, this.sendBookingConfirmation);
  }
}
