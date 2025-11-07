import { Module, OnModuleInit } from '@nestjs/common';
import { CoreSubscriptionsRouter } from './core/router';
import { CoreSubscriptionsModule } from './core/core-subscriptions.module';
import { RabbitMQService } from '../../contexts/core/infrastructure/rabbitmq/rabbitmq.service';

@Module({
  imports: [CoreSubscriptionsModule],
  providers: [RabbitMQService],
})
export class SubscriptionsModule implements OnModuleInit {
  constructor(
    private readonly coreSubscriptionsRouter: CoreSubscriptionsRouter,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async onModuleInit() {
    await this.rabbitMQService.connect();
    await this.coreSubscriptionsRouter.subscribe();
  }
}
