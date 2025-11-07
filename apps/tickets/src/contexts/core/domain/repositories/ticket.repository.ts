import { Ticket } from '../entities/ticket';
import { EventId } from '../value-objects/event-id';
import { UserId } from '../value-objects/user-id';

export abstract class TicketRepository {
  abstract save(ticket: Ticket): Promise<void>;
  abstract findByEventIdAndUserId(eventId: EventId, userId: UserId): Promise<Ticket[]>;
  abstract countByEventId(eventId: EventId): Promise<number>;
}

