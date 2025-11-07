import { Module } from '@nestjs/common';
import { EventsSubscriptionsRouter } from './events/router';
import { UsersSubscriptionsRouter } from './users/router';
import { CoreSubscriptionsRouter } from './router';
import { OnEventCreatedEventHandler } from './events/on_event_created/event_handler';
import { OnEventDeletedEventHandler } from './events/on_event_deleted/event_handler';
import { OnUserCreatedEventHandler } from './users/on_user_created/event_handler';
import { EventRepository } from '../../../contexts/core/domain/repositories/event.repository';
import { UserRepository } from '../../../contexts/core/domain/repositories/user.repository';
import { PrismaEventRepository } from '../../../contexts/core/infrastructure/repositories/prisma-event.repository';
import { PrismaUserRepository } from '../../../contexts/core/infrastructure/repositories/prisma-user.repository';
import { CreateEventProjectionService } from '../../../contexts/core/application/services/create-event-projection.service';
import { DeleteEventProjectionService } from '../../../contexts/core/application/services/delete-event-projection.service';
import { CreateUserProjectionService } from '../../../contexts/core/application/services/create-user-projection.service';
import { PrismaService } from '../../../contexts/core/infrastructure/prisma/prisma.service';
import { RabbitMQService } from '../../../contexts/core/infrastructure/rabbitmq/rabbitmq.service';

@Module({
  providers: [
    PrismaService,
    RabbitMQService,
    {
      provide: EventRepository,
      useClass: PrismaEventRepository,
    },
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    CreateEventProjectionService,
    DeleteEventProjectionService,
    CreateUserProjectionService,
    OnEventCreatedEventHandler,
    OnEventDeletedEventHandler,
    OnUserCreatedEventHandler,
    EventsSubscriptionsRouter,
    UsersSubscriptionsRouter,
    CoreSubscriptionsRouter,
  ],
  exports: [CoreSubscriptionsRouter, EventsSubscriptionsRouter, UsersSubscriptionsRouter],
})
export class CoreSubscriptionsModule {}

