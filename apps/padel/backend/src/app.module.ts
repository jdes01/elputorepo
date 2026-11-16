import { Module } from '@nestjs/common';
import { BookingsModule } from './bookings/bookings.module';
import { ClubsModule } from './clubs/clubs.module';
import { DatabaseModule } from './database.module';
import { MailModule } from './mail.module';

@Module({
  imports: [DatabaseModule, MailModule, ClubsModule, BookingsModule],
})
export class AppModule {}
