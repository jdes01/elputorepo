import { Injectable } from '@nestjs/common';
import { OnEventCreatedEventHandler } from './on_event_created/event_handler';
import { OnEventDeletedEventHandler } from './on_event_deleted/event_handler';
import { RabbitMQService } from '@/contexts/core/infrastructure/rabbitmq/rabbitmq.service';

@Injectable()
export class EventsSubscriptionsRouter {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly onEventCreatedHandler: OnEventCreatedEventHandler,
    private readonly onEventDeletedHandler: OnEventDeletedEventHandler,
  ) {}

  async subscribe(): Promise<void> {
    await this.rabbitMQService.subscribe('events.eventcreated', async (message) => {
      await this.onEventCreatedHandler.handle(message);
    });
    await this.rabbitMQService.subscribe('events.eventdeleted', async (message) => {
      await this.onEventDeletedHandler.handle(message);
    });
  }
}

