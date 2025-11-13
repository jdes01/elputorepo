import { Injectable, Logger } from '@nestjs/common';
import { EventRepository } from '../../domain/repositories/event.repository';
import { Event } from '../../domain/entities/event';
import { EventId } from '../../domain/value-objects/event-id';

@Injectable()
export class CreateEventProjectionService {
  private readonly logger = new Logger(CreateEventProjectionService.name);

  constructor(private readonly eventRepository: EventRepository) {}

  async execute(eventId: string, capacity: number): Promise<void> {
    const event = Event.create(new EventId(eventId), capacity);
    await this.eventRepository.save(event);
    this.logger.log(`Event projection created: ${eventId} with capacity ${capacity}`);
  }
}
