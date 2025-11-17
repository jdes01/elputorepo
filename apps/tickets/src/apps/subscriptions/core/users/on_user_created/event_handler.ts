import { Injectable, Logger } from '@nestjs/common';
import { CreateUserProjectionService } from '@contexts/core/application/services/create-user-projection.service';

@Injectable()
export class OnUserCreatedEventHandler {
  private readonly logger = new Logger(OnUserCreatedEventHandler.name);

  constructor(
    private readonly createUserProjectionService: CreateUserProjectionService,
  ) {}

  async handle(message: unknown): Promise<void> {
    try {
      if (!message || typeof message !== 'object') {
        this.logger.warn('UserCreated message is not an object', message);
        return;
      }

      const msg = message as Record<string, unknown>;
      const userId = msg.user_id;
      const email = msg.email;

      if (!userId || typeof userId !== 'string') {
        this.logger.warn('UserCreated message missing user_id', message);
        return;
      }

      if (!email || typeof email !== 'string') {
        this.logger.warn('UserCreated message missing email', message);
        return;
      }

      await this.createUserProjectionService.execute(userId, email);
      this.logger.log(`Handled UserCreated for user ${userId} with email ${email}`);
    } catch (error) {
      this.logger.error('Error handling UserCreated', error);
      throw error;
    }
  }
}
