import { Module } from '@nestjs/common';
import { BookingsModule } from './bookings/infrastructure/bookings.module';
import { ClubsModule } from './clubs/infrastructure/clubs.module';
import { DatabaseModule } from './shared/infrastructure/database.module';
import { MailModule } from './shared/infrastructure/mail.module';

@Module({
  imports: [DatabaseModule, MailModule, ClubsModule, BookingsModule],
})
export class AppModule {}
