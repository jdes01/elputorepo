import { Result } from 'neverthrow';
import { Ticket } from '../entities/ticket';
import { EventId } from '../value-objects/event-id';
import { UserId } from '../value-objects/user-id';

export abstract class TicketRepository {
  abstract save(ticket: Ticket): Promise<Result<void, Error>>;
  abstract findByEventIdAndUserId(eventId: EventId, userId: UserId): Promise<Result<Ticket[], Error>>;
  abstract countByEventId(eventId: EventId): Promise<Result<number, Error>>;
}

