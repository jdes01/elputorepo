import { Injectable } from '@nestjs/common';
import { OnUserCreatedEventHandler } from './on_user_created/event_handler';
import { RabbitMQService } from '@/contexts/core/infrastructure/rabbitmq/rabbitmq.service';

@Injectable()
export class UsersSubscriptionsRouter {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly onUserCreatedHandler: OnUserCreatedEventHandler,
  ) {}

  async subscribe(): Promise<void> {
    await this.rabbitMQService.subscribe('users.usercreated', async (message) => {
      await this.onUserCreatedHandler.handle(message);
    });
  }
}

