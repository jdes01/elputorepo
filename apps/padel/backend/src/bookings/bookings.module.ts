import { Module } from '@nestjs/common';
import { ClubsModule } from '../clubs/clubs.module';
import { BookingRepository } from './booking.repository';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { DrizzleBookingRepository } from './drizzle-booking.repository';

@Module({
  imports: [ClubsModule],
  controllers: [BookingsController],
  providers: [BookingsService, { provide: BookingRepository, useClass: DrizzleBookingRepository }],
})
export class BookingsModule {}
