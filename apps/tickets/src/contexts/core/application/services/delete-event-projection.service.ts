import { Injectable, Logger } from '@nestjs/common';
import { EventRepository } from '../../domain/repositories/event.repository';
import { EventId } from '../../domain/value-objects/event-id';

@Injectable()
export class DeleteEventProjectionService {
  private readonly logger = new Logger(DeleteEventProjectionService.name);

  constructor(private readonly eventRepository: EventRepository) {}

  async execute(eventId: string): Promise<void> {
    await this.eventRepository.delete(new EventId(eventId));
    this.logger.log(`Event projection deleted: ${eventId}`);
  }
}
