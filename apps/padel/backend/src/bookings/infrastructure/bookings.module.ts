import { Module, type OnModuleInit } from '@nestjs/common';
import { CourtWasOpenedEvent } from '../../clubs/domain/events/court-was-opened.event';
import { ClubsModule } from '../../clubs/infrastructure/clubs.module';
import { InProcessEventBus } from '../../shared/infrastructure/in-process-event-bus';
import { BookCourtHandler } from '../application/commands/book-court/book-court.handler';
import { CancelBookingHandler } from '../application/commands/cancel-booking/cancel-booking.handler';
import { SendBookingConfirmationHandler } from '../application/events/send-booking-confirmation/send-booking-confirmation.handler';
import { SendCancellationConfirmationHandler } from '../application/events/send-cancellation-confirmation/send-cancellation-confirmation.handler';
import { CourtDayFinder } from '../application/queries/get-availability/court-day.finder';
import { GetAvailabilityHandler } from '../application/queries/get-availability/get-availability.handler';
import { ListMyBookingsHandler } from '../application/queries/list-my-bookings/list-my-bookings.handler';
import { MyBookingsFinder } from '../application/queries/list-my-bookings/my-bookings.finder';
import { BookingWasCancelledEvent } from '../domain/events/booking-was-cancelled.event';
import { CourtWasBookedEvent } from '../domain/events/court-was-booked.event';
import { CourtDayRepository } from '../domain/repositories/court-day.repository';
import { BookCourtController } from './controllers/book-court.controller';
import { CancelBookingController } from './controllers/cancel-booking.controller';
import { GetAvailabilityController } from './controllers/get-availability.controller';
import { ListMyBookingsController } from './controllers/list-my-bookings.controller';
import { DrizzleCourtDayRepository } from './persistence/drizzle-court-day.repository';
import { CachedCourtDayFinder } from './read-model/cache/cached-court-day.finder';
import { CourtDayCache } from './read-model/cache/court-day.cache';
import { RedisCourtDayCache } from './read-model/cache/redis-court-day.cache';
import { MongoCourtDayFinder } from './read-model/mongo-court-day.finder';
import { MongoMyBookingsFinder } from './read-model/mongo-my-bookings.finder';
import { MongoReadModelProjector } from './read-model/mongo-read-model.projector';

@Module({
  imports: [ClubsModule],
  controllers: [BookCourtController, CancelBookingController, GetAvailabilityController, ListMyBookingsController],
  providers: [
    // Escritura: command handlers sobre repositorios.
    BookCourtHandler,
    CancelBookingHandler,
    { provide: CourtDayRepository, useClass: DrizzleCourtDayRepository },
    // Lectura: query handlers sobre finders.
    GetAvailabilityHandler,
    ListMyBookingsHandler,
    MongoCourtDayFinder,
    { provide: CourtDayCache, useClass: RedisCourtDayCache },
    { provide: CourtDayFinder, useClass: CachedCourtDayFinder },
    { provide: MyBookingsFinder, useClass: MongoMyBookingsFinder },
    // Reacciones a eventos.
    SendBookingConfirmationHandler,
    SendCancellationConfirmationHandler,
    MongoReadModelProjector,
  ],
})
export class BookingsModule implements OnModuleInit {
  constructor(
    private readonly bus: InProcessEventBus,
    private readonly sendBookingConfirmation: SendBookingConfirmationHandler,
    private readonly sendCancellationConfirmation: SendCancellationConfirmationHandler,
    private readonly readModel: MongoReadModelProjector,
  ) {}

  onModuleInit(): void {
    this.bus.subscribe(CourtWasBookedEvent, this.sendBookingConfirmation);
    this.bus.subscribe(BookingWasCancelledEvent, this.sendCancellationConfirmation);
    // El modelo de lectura se alimenta de los mismos eventos.
    this.bus.subscribe(CourtWasOpenedEvent, { handle: (e) => this.readModel.courtWasOpened(e) });
    this.bus.subscribe(CourtWasBookedEvent, { handle: (e) => this.readModel.courtWasBooked(e) });
    this.bus.subscribe(BookingWasCancelledEvent, { handle: (e) => this.readModel.bookingWasCancelled(e) });
  }
}
