import { Result } from 'neverthrow';
import { Event } from '../entities/event';
import { EventId } from '../value-objects/event-id';

export abstract class EventRepository {
  abstract save(event: Event): Promise<Result<void, Error>>;
  abstract delete(eventId: EventId): Promise<Result<void, Error>>;
  abstract findById(eventId: EventId): Promise<Result<Event | null, Error>>;
}

