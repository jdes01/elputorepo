import { Injectable, Logger } from '@nestjs/common';
import { DeleteEventProjectionService } from '@/contexts/core/application/services/delete-event-projection.service';

@Injectable()
export class OnEventDeletedEventHandler {
  private readonly logger = new Logger(OnEventDeletedEventHandler.name);

  constructor(private readonly deleteEventProjectionService: DeleteEventProjectionService) {}

  async handle(message: unknown): Promise<void> {
    try {
      if (!message || typeof message !== 'object') {
        this.logger.warn('EventDeleted message is not an object', message);
        return;
      }

      const msg = message as Record<string, unknown>;
      const eventId = msg.event_id;

      if (!eventId || typeof eventId !== 'string') {
        this.logger.warn('EventDeleted message missing event_id', message);
        return;
      }

      await this.deleteEventProjectionService.execute(eventId);
      this.logger.log(`Handled EventDeleted for event ${eventId}`);
    } catch (error) {
      this.logger.error('Error handling EventDeleted', error);
      throw error;
    }
  }
}
