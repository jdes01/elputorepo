import { EventId } from '../value-objects/event-id';
import { TicketId } from '../value-objects/ticket-id';
import { UserId } from '../value-objects/user-id';

export interface TicketPrimitives {
  id: string;
  eventId: string;
  userId: string;
  createdAt: Date;
}

export class Ticket {
  constructor(
    public readonly id: TicketId,
    public readonly eventId: EventId,
    public readonly userId: UserId,
    public readonly createdAt: Date,
  ) {}

  static create(eventId: EventId, userId: UserId): Ticket {
    return new Ticket(
      TicketId.generate(),
      eventId,
      userId,
      new Date(),
    );
  }

  static fromPrimitives(data: TicketPrimitives): Ticket {
    return new Ticket(
      new TicketId(data.id),
      new EventId(data.eventId),
      new UserId(data.userId),
      data.createdAt,
    );
  }

  toPrimitives(): TicketPrimitives {
    return {
      id: this.id.value,
      eventId: this.eventId.value,
      userId: this.userId.value,
      createdAt: this.createdAt,
    };
  }
}

