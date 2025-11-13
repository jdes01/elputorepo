import { Injectable, Logger } from '@nestjs/common';
import { CreateEventProjectionService } from '@/contexts/core/application/services/create-event-projection.service';

@Injectable()
export class OnEventCreatedEventHandler {
  private readonly logger = new Logger(OnEventCreatedEventHandler.name);

  constructor(private readonly createEventProjectionService: CreateEventProjectionService) {}

  async handle(message: unknown): Promise<void> {
    try {
      if (!message || typeof message !== 'object') {
        this.logger.warn('EventCreated message is not an object', message);
        return;
      }

      const msg = message as Record<string, unknown>;
      const eventId = msg.event_id;
      const capacity = msg.capacity;

      if (!eventId || typeof eventId !== 'string') {
        this.logger.warn('EventCreated message missing event_id', message);
        return;
      }

      if (!capacity || typeof capacity !== 'number') {
        this.logger.warn('EventCreated message missing capacity', message);
        return;
      }

      await this.createEventProjectionService.execute(eventId, capacity);
      this.logger.log(`Handled EventCreated for event ${eventId} with capacity ${capacity}`);
    } catch (error) {
      this.logger.error('Error handling EventCreated', error);
      throw error;
    }
  }
}
