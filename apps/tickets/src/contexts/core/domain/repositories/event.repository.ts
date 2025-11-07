import { Event } from '../entities/event';
import { EventId } from '../value-objects/event-id';

export abstract class EventRepository {
  abstract save(event: Event): Promise<void>;
  abstract delete(eventId: EventId): Promise<void>;
  abstract findById(eventId: EventId): Promise<Event | null>;
}

