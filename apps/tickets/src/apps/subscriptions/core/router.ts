import { Injectable } from '@nestjs/common';
import { EventsSubscriptionsRouter } from './events/router';
import { UsersSubscriptionsRouter } from './users/router';

@Injectable()
export class CoreSubscriptionsRouter {
  constructor(
    private readonly eventsRouter: EventsSubscriptionsRouter,
    private readonly usersRouter: UsersSubscriptionsRouter,
  ) {}

  async subscribe(): Promise<void> {
    await this.eventsRouter.subscribe();
    await this.usersRouter.subscribe();
  }
}
