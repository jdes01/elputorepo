import { Module } from '@nestjs/common';
import { SubscriptionsModule } from './apps/subscriptions/subscriptions.module';
import { RestModule } from './apps/rest/rest.module';
import { PrismaService } from './contexts/core/infrastructure/prisma/prisma.service';

@Module({
  imports: [SubscriptionsModule, RestModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}



