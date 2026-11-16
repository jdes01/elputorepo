import { Module } from '@nestjs/common';
import { BookingsModule } from './bookings/infrastructure/bookings.module';
import { ClubsModule } from './clubs/infrastructure/clubs.module';
import { DatabaseModule } from './shared/infrastructure/database.module';
import { EventBusModule } from './shared/infrastructure/in-process-event-bus';
import { MailModule } from './shared/infrastructure/mail.module';
import { MongoModule } from './shared/infrastructure/mongo.module';

@Module({
  imports: [DatabaseModule, MongoModule, MailModule, EventBusModule, ClubsModule, BookingsModule],
})
export class AppModule {}
