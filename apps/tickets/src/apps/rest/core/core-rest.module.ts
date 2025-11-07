import { Module } from '@nestjs/common';
import { TicketsController } from './tickets/acquire_ticket/controller';
import { AcquireTicketCommandHandler } from '../../../contexts/core/application/commands/acquire-ticket/command-handler';
import { EventRepository } from '../../../contexts/core/domain/repositories/event.repository';
import { UserRepository } from '../../../contexts/core/domain/repositories/user.repository';
import { TicketRepository } from '../../../contexts/core/domain/repositories/ticket.repository';
import { PrismaEventRepository } from '../../../contexts/core/infrastructure/repositories/prisma-event.repository';
import { PrismaUserRepository } from '../../../contexts/core/infrastructure/repositories/prisma-user.repository';
import { PrismaTicketRepository } from '../../../contexts/core/infrastructure/repositories/prisma-ticket.repository';
import { PrismaService } from '../../../contexts/core/infrastructure/prisma/prisma.service';

@Module({
  controllers: [TicketsController],
  providers: [
    PrismaService,
    {
      provide: EventRepository,
      useClass: PrismaEventRepository,
    },
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: TicketRepository,
      useClass: PrismaTicketRepository,
    },
    AcquireTicketCommandHandler,
  ],
})
export class CoreRestModule {}

